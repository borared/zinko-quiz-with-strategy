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
    isCorrect: a.checked,
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
  const correctId = question.answers.find(a => a.checked)?.id;
  const stats = buildAnswerStats(game);

  // Award points based on correctness and speed
  game.players.forEach(player => {
    const selectedId = game.answers[player.id];
    const isCorrect = selectedId === correctId;
    const timeTaken = game.answerTimes[player.id] || QUESTION_TIME_SECONDS * 1000;
    const speedBonus = isCorrect ? Math.max(0, Math.round((1 - timeTaken / (QUESTION_TIME_SECONDS * 1000)) * 500)) : 0;
    const points = isCorrect ? 1000 + speedBonus : 0;
    player.score += points;
    player.lastPoints = points;
    player.lastCorrect = isCorrect;

    io.to(player.socketId).emit('game:player-result', {
      isCorrect,
      correctAnswerId: correctId,
      pointsEarned: points,
      totalScore: player.score,
    });
  });

  io.to(pin).emit('game:reveal-results', {
    correctAnswerId: correctId,
    stats,
    leaderboard: getLeaderboard(game.players).slice(0, 5),
  });
}

module.exports = {
  QUESTION_TIME_SECONDS,
  generatePin,
  getLeaderboard,
  buildAnswerStats,
  startTimer,
  revealResults,
};