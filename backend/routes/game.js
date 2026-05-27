const express = require('express');
const router = express.Router();
const { createGame, getGame } = require('../lib/socketHandler');
const supabase = require('../lib/supabaseClient');
const { getAuth } = require('@clerk/express');

/**
 * POST /api/game/host
 * Host creates a new game session for a quiz.
 * Returns: { pin }
 */
router.post('/host', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required to host a game.' });

    const { quizId } = req.body;
    if (!quizId) return res.status(400).json({ error: 'quizId is required.' });

    // Verify quiz belongs to the requesting user
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('id, title, creator_id')
      .eq('id', quizId)
      .single();

    if (error || !quiz) return res.status(404).json({ error: 'Quiz not found.' });
    if (quiz.creator_id !== userId) return res.status(403).json({ error: 'You do not own this quiz.' });

    const pin = createGame({ quizId, hostUserId: userId });

    console.log(`🎮 Game created — PIN: ${pin} | Quiz: "${quiz.title}" | Host: ${userId}`);
    res.status(201).json({ pin, quizTitle: quiz.title });
  } catch (err) {
    console.error('❌ Error creating game:', err.message);
    res.status(500).json({ error: 'Failed to create game session.' });
  }
});

/**
 * GET /api/game/:pin
 * Validate a PIN and get room status.
 * Used by the player join flow before connecting via socket.
 * Returns: { valid, phase, playerCount }
 */
router.get('/:pin', (req, res) => {
  const { pin } = req.params;
  const game = getGame(pin);

  if (!game) {
    return res.status(404).json({ valid: false, message: 'Game not found. Check your PIN.' });
  }

  res.json({
    valid: true,
    phase: game.phase,
    playerCount: game.players.length,
    quizId: game.quizId,
  });
});

module.exports = router;
