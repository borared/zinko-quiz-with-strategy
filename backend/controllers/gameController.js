const { createGame, getGame } = require('../lib/socketHandler');
const gameService = require('../services/gameService');

/**
 * Handle POST /api/game/host
 * Host creates a new game session for a quiz.
 */
const hostGame = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required to host a game.' });

    const { quizId } = req.body;
    if (!quizId) return res.status(400).json({ error: 'quizId is required.' });

    // Verify quiz belongs to the requesting user
    const quiz = await gameService.getQuizForGameHost(quizId);

    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    if (quiz.creator_id !== userId) return res.status(403).json({ error: 'You do not own this quiz.' });

    const pin = createGame({ quizId, hostUserId: userId });

    console.log(`🎮 Game created — PIN: ${pin} | Quiz: "${quiz.title}" | Host: ${userId}`);
    res.status(201).json({ pin, quizTitle: quiz.title });
  } catch (err) {
    console.error('❌ Error creating game:', err.message);
    res.status(500).json({ error: 'Failed to create game session.' });
  }
};

/**
 * Handle GET /api/game/:pin
 * Validate a PIN and get room status.
 */
const PIN_PATTERN = /^\d{6}$/;

const getGameStatus = (req, res) => {
  const { pin } = req.params;
  if (!PIN_PATTERN.test(pin)) {
    return res.status(400).json({ valid: false, message: 'Invalid PIN format.' });
  }
  const game = getGame(pin);

  if (!game) {
    return res.status(404).json({ valid: false, message: 'Game not found. Check your PIN.' });
  }

  res.json({
    valid: true,
    phase: game.phase,
    playerCount: game.players.length,
    gameType: game.gameType,
  });
};

module.exports = {
  hostGame,
  getGameStatus,
};
