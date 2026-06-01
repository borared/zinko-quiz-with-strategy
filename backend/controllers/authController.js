const { getAuth } = require('@clerk/express');

/**
 * Handle GET /api/auth/me
 * Public — returns the current user's Clerk userId if signed in, or null.
 */
const getMe = (req, res) => {
  const { userId } = getAuth(req);
  res.json({ userId: userId || null });
};

/**
 * Handle GET /api/auth/profile
 * Protected — returns the authenticated user's info.
 */
const getProfile = (req, res) => {
  const { userId, sessionId } = getAuth(req);
  res.json({
    message: 'Authenticated successfully.',
    userId,
    sessionId,
  });
};

module.exports = {
  getMe,
  getProfile,
};
