const { getAuth } = require('@clerk/express');

/**
 * requireAuth middleware
 * Checks for a valid Clerk session on the request.
 * Returns 401 JSON (API-safe, no redirects) if not authenticated.
 */
const requireAuth = (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  }

  next();
};

module.exports = { requireAuth };
