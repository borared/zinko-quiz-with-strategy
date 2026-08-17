// Utility functions and constants for socket handling
const { resolveQuestionType, QUESTION_TYPES } = require('./questionTypes');
const {
  getCorrectLayerOrder,
  parseDragLayerAnswer,
  isLayerOrderCorrect,
  sortAnswersByLayer,
} = require('./dragLayersUtils');
const {
  getCorrectMatches,
  parseLineMatchingAnswer,
  isLineMatchingCorrect,
  buildLineMatchingStats,
} = require('./lineMatchingUtils');

const { getQuestionTimeLimit, QUESTION_TIME_SECONDS } = require('./questionTimeLimit');

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

  if (game.gameType === 'PICTURE_RACE') {
    return []; // No bar chart stats needed for text input
  }

  const questionType = resolveQuestionType(question);

  if (questionType === QUESTION_TYPES.LINE_MATCHING) {
    return buildLineMatchingStats(game, question);
  }

  if (questionType === QUESTION_TYPES.DRAG_LAYERS) {
    const layers = sortAnswersByLayer(question.answers);
    const correctOrder = getCorrectLayerOrder(question.answers);
    const layerCounts = layers.map(() => 0);

    Object.values(game.answers).forEach((rawAnswer) => {
      const submitted = parseDragLayerAnswer(rawAnswer);
      if (!submitted) return;
      submitted.forEach((answerId, index) => {
        if (answerId === correctOrder[index]) {
          layerCounts[index] += 1;
        }
      });
    });

    return layers.map((answer, index) => ({
      id: answer.id,
      text: answer.text,
      color: answer.color,
      count: layerCounts[index] || 0,
      isCorrect: true,
      layerLabel: `Step ${index + 1}`,
    }));
  }

  const answerCounts = {};
  question.answers.forEach((answer) => { answerCounts[answer.id] = 0; });
  Object.values(game.answers).forEach((ans) => {
    if (answerCounts[ans] !== undefined) answerCounts[ans] += 1;
  });

  return question.answers.map((answer) => ({
    id: answer.id,
    text: answer.text,
    color: answer.color,
    count: answerCounts[answer.id] || 0,
    isCorrect: answer.isCorrect === true || answer.checked === true || String(answer.isCorrect) === 'true' || String(answer.checked) === 'true',
  }));
}

// Imported above

// Start the per-question countdown timer and emit ticks
function startTimer(io, pin, games) {
  const game = games.get(pin);
  if (!game) return;

  const question = game.questions[game.currentQuestionIndex];
  const timeLimit = getQuestionTimeLimit(question);
  game.currentTimeLimit = timeLimit;
  let timeLeft = timeLimit;
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
  const questionType = resolveQuestionType(question);
  const isDragLayers = questionType === QUESTION_TYPES.DRAG_LAYERS;
  const isLineMatching = questionType === QUESTION_TYPES.LINE_MATCHING;
  const isPictureRace = game.gameType === 'PICTURE_RACE';

  const correctLayerOrder = isDragLayers ? getCorrectLayerOrder(question.answers) : [];
  const correctMatches = isLineMatching ? getCorrectMatches(question.answers) : {};
  const correctIds = (isDragLayers || isPictureRace)
    ? []
    : question.answers
      .filter((answer) => answer.isCorrect === true || answer.checked === true || String(answer.isCorrect) === 'true' || String(answer.checked) === 'true')
      .map((answer) => answer.id);

  let correctId = null;
  if (isPictureRace) {
    correctId = question.answer; // the correct string
  } else if (isDragLayers) {
    correctId = JSON.stringify(correctLayerOrder);
  } else if (isLineMatching) {
    correctId = JSON.stringify(correctMatches);
  } else {
    correctId = correctIds.length > 0 ? correctIds[0] : null;
  }
  const stats = buildAnswerStats(game);

  // 1. Award base points based on correctness and speed, considering Rabbit
  game.players.forEach(player => {
    const selectedId = game.answers[player.id];
    const isMissed = selectedId === undefined;
    
    let isCorrect = false;
    if (!isMissed) {
      if (isPictureRace) {
        isCorrect = typeof selectedId === 'string' && selectedId.trim().toLowerCase() === question.answer.trim().toLowerCase();
      } else if (isDragLayers) {
        isCorrect = isLayerOrderCorrect(parseDragLayerAnswer(selectedId), correctLayerOrder);
      } else if (isLineMatching) {
        isCorrect = isLineMatchingCorrect(parseLineMatchingAnswer(selectedId), correctMatches);
      } else {
        isCorrect = correctIds.includes(selectedId);
      }
    }
    const timeLimitMs = (game.currentTimeLimit || QUESTION_TIME_SECONDS) * 1000;
    const timeTaken = game.answerTimes[player.id] || timeLimitMs;
    const speedBonus = isCorrect ? Math.max(0, Math.round((1 - timeTaken / timeLimitMs) * 500)) : 0;
    
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
    player.lastMissed = isMissed;
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
      if (frogPlayer) {
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
      isMissed: player.lastMissed,
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
    originalImage: isPictureRace ? question.original_image : null,
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