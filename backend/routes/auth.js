const express = require('express');
const { getAuth } = require('@clerk/express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/auth/me
 * Public — returns the current user's Clerk userId if signed in, or null.
 */
router.get('/me', (req, res) => {
  const { userId } = getAuth(req);
  res.json({ userId: userId || null });
});

/**
 * GET /api/auth/profile
 * Protected — returns the authenticated user's info.
 * Returns 401 if not signed in.
 */
router.get('/profile', requireAuth, (req, res) => {
  const { userId, sessionId } = getAuth(req);
  res.json({
    message: 'Authenticated successfully.',
    userId,
    sessionId,
  });
});

module.exports = router;
