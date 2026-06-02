const express = require('express');
const { requireAuth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * GET /api/auth/me
 * Public — returns the current user's Clerk userId if signed in, or null.
 */
router.get('/me', authController.getMe);

/**
 * GET /api/auth/profile
 * Protected — returns the authenticated user's info.
 * Returns 401 if not signed in.
 */
router.get('/profile', requireAuth, authController.getProfile);

module.exports = router;
