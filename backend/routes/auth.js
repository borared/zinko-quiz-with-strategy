const express = require('express');
const { requireClerkAuth, requireCustomAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/token
 * Protected by Clerk — generates a custom JWT
 */
router.post('/token', authLimiter, requireClerkAuth, authController.generateToken);

/**
 * GET /api/auth/me
 * Public — returns the current user's Clerk userId if signed in, or null.
 */
router.get('/me', authController.getMe);

/**
 * GET /api/auth/profile
 * Protected by Custom JWT — returns the authenticated user's info.
 */
router.get('/profile', requireCustomAuth, authController.getProfile);

module.exports = router;