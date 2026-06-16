// Utility functions and constants for socket handling

// Game timer length (seconds)
const QUESTION_TIME_SECONDS = 20;

// Generate a unique 6-digit PIN for a new game
function generatePin(games) {
  let pin;
  do {
    pin = String(Math.floor(100000 + Math.random() * 900000));
  } while (games.has(pin));
  return pin;
}

// Build a sorted leaderboard (top scores first)
function getLeaderboard(players) {
  return [...players]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

// Create answer statistics for the current question
function buildAnswerStats(game) {
  const question = game.questions[game.currentQuestionIndex];
  if (!question) return [];
  const answerCounts = {};
  // initialise all answer counters
  question.answers.forEach(a => { answerCounts[a.id] = 0; });
  // tally submitted answers
  Object.values(game.answers).forEach(ans => {
    if (answerCounts[ans] !== undefined) answerCounts[ans]++;
  });
  return question.answers.map(a => ({
    id: a.id,
    text: a.text,
    color: a.color,
    count: answerCounts[a.id] || 0,
    isCorrect: a.isCorrect === true || a.checked === true,
  }));
}

// Start the per-question countdown timer and emit ticks
function startTimer(io, pin, games) {
  const game = games.get(pin);
  if (!game) return;

  let timeLeft = QUESTION_TIME_SECONDS;
  game.timeLeft = timeLeft;

  clearInterval(game.timer);
  game.timer = setInterval(() => {
    const g = games.get(pin);
    if (!g) { clearInterval(game.timer); return; }

    g.timeLeft = --timeLeft;
    io.to(pin).emit('game:timer-tick', { timeLeft: g.timeLeft });

    if (timeLeft <= 0) {
      clearInterval(g.timer);
      revealResults(io, pin, games);
    }
  }, 1000);
}

// Reveal results for the current question, award points and broadcast
function revealResults(io, pin, games) {
  const game = games.get(pin);
  if (!game || game.phase === 'RESULT') return;

  game.phase = 'RESULT';
  const question = game.questions[game.currentQuestionIndex];
  const correctId = question.answers.find(a => a.isCorrect === true || a.checked === true)?.id;
  const stats = buildAnswerStats(game);

  // 1. Award base points based on correctness and speed, considering Rabbit
  game.players.forEach(player => {
    const selectedId = game.answers[player.id];
    const isCorrect = selectedId === correctId;
    const timeTaken = game.answerTimes[player.id] || QUESTION_TIME_SECONDS * 1000;
    const speedBonus = isCorrect ? Math.max(0, Math.round((1 - timeTaken / (QUESTION_TIME_SECONDS * 1000)) * 500)) : 0;
    
    let points = isCorrect ? 1000 + speedBonus : 0;
    
    // Rabbit modifier
    const rabbit = game.rabbitActive?.[player.team];
    let rabbitBonusApplied = false;
    if (rabbit && rabbit.startTime && isCorrect) {
      const absTime = game.absoluteAnswerTimes?.[player.id] || Date.now();
      if (absTime - rabbit.startTime <= 5000) {
        points *= 2;
        rabbitBonusApplied = true;
      }
    }

    // Minigame Bonus Points modifier
    const activeMultiplier = game.activeMultiplier;
    let bonusPointsApplied = false;
    if (activeMultiplier && activeMultiplier.team === player.team && activeMultiplier.durationRounds > 0 && isCorrect) {
      points *= activeMultiplier.multiplier;
      points = Math.round(points);
      bonusPointsApplied = true;
    }

    player.score += points;
    player.lastPoints = points;
    player.lastCorrect = isCorrect;
    player.rabbitBonusApplied = rabbitBonusApplied;
    player.bonusPointsApplied = bonusPointsApplied;
    player.stolenPoints = 0; // reset
  });

  // 2. Frog stealing logic
  const teams = ['A', 'B'];
  teams.forEach(team => {
    const frogActive = game.frogActive?.[team];
    if (frogActive) {
      const frogPlayer = game.players.find(p => p.id === frogActive.playerId);
      if (frogPlayer && frogPlayer.lastCorrect) {
        // Find fastest correct enemy
        const enemyTeam = team === 'A' ? 'B' : 'A';
        const correctEnemies = game.players.filter(p => p.team === enemyTeam && p.lastCorrect);
        
        if (correctEnemies.length > 0) {
          correctEnemies.sort((a, b) => (game.answerTimes[a.id] || 99999) - (game.answerTimes[b.id] || 99999));
          const fastestEnemy = correctEnemies[0];
          
          const stealAmount = Math.floor(fastestEnemy.lastPoints * 0.5);
          
          fastestEnemy.score -= stealAmount;
          fastestEnemy.lastPoints -= stealAmount;
          fastestEnemy.stolenPoints = -stealAmount; // negative means they lost it
          
          frogPlayer.score += stealAmount;
          frogPlayer.lastPoints += stealAmount;
          frogPlayer.stolenPoints = stealAmount; // positive means they gained it
        }
      }
    }
  });

  // 3. Emit results
  game.players.forEach(player => {
    io.to(player.socketId).emit('game:player-result', {
      isCorrect: player.lastCorrect,
      correctAnswerId: correctId,
      pointsEarned: player.lastPoints,
      totalScore: player.score,
      rabbitBonusApplied: player.rabbitBonusApplied,
      bonusPointsApplied: player.bonusPointsApplied,
      stolenPoints: player.stolenPoints,
    });
  });

  io.to(pin).emit('game:reveal-results', {
    correctAnswerId: correctId,
    stats,
    leaderboard: getLeaderboard(game.players).slice(0, 5),
  });

  // 4. Decrement active multiplier
  if (game.activeMultiplier && game.activeMultiplier.durationRounds > 0) {
    game.activeMultiplier.durationRounds -= 1;
    if (game.activeMultiplier.durationRounds <= 0) {
      game.activeMultiplier = null;
    }
  }
}

module.exports = {
  QUESTION_TIME_SECONDS,
  generatePin,
  getLeaderboard,
  buildAnswerStats,
  startTimer,
  revealResults,
};