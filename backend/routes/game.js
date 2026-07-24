const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

const { requireCustomAuth } = require('../middleware/auth');

/**
 * POST /api/game/host
 * Host creates a new game session for a quiz.
 * Returns: { pin }
 */
/**
 * @swagger
 * /api/game/host:
 *   post:
 *     summary: POST /host
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/host', requireCustomAuth, gameController.hostGame);

/**
 * GET /api/game/:pin
 * Validate a PIN and get room status.
 * Used by the player join flow before connecting via socket.
 * Returns: { valid, phase, playerCount }
 */
/**
 * @swagger
 * /api/game/{pin}:
 *   get:
 *     summary: GET /:pin
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: pin
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/:pin', gameController.getGameStatus);

module.exports = router;
