const { getAuth } = require('@clerk/express');
const jwt = require('jsonwebtoken');

/**
 * requireClerkAuth — valid Clerk session required (used for token exchange).
 */
const requireClerkAuth = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized. Clerk session invalid.' });
  }
  next();
};

/**
 * requireCustomAuth — valid backend JWT required.
 */
const requireCustomAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Missing token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({ error: 'Unauthorized. Invalid token payload.' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
};

/**
 * optionalCustomAuth — attaches req.user when a valid JWT is present; never blocks.
 */
const optionalCustomAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.userId) req.user = decoded;
  } catch {
    // Ignore invalid optional tokens
  }
  next();
};

/**
 * requireSelf — URL param must match the authenticated user's Clerk ID.
 * Usage: requireSelf('userId')
 */
const requireSelf = (paramName = 'userId') => (req, res, next) => {
  const paramValue = req.params[paramName];
  const authUserId = req.user?.userId;

  if (!authUserId || paramValue !== authUserId) {
    return res.status(403).json({ error: 'Forbidden. You can only access your own resources.' });
  }
  next();
};

module.exports = {
  requireClerkAuth,
  requireCustomAuth,
  optionalCustomAuth,
  requireSelf,
};