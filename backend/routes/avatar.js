const express = require('express');
const router = express.Router();
const { getAvatars } = require('../controllers/avatarController');
const { optionalCustomAuth } = require('../middleware/auth');

// GET /api/avatars
/**
 * @swagger
 * /api/avatars:
 *   get:
 *     summary: GET /
 *     tags: [Avatar]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', optionalCustomAuth, getAvatars);

module.exports = router;
