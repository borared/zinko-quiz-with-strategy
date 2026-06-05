const { getAuth } = require('@clerk/express');
const jwt = require('jsonwebtoken');

/**
 * requireClerkAuth
 * Checks for a valid Clerk session. Used for generating custom JWTs.
 */
const requireClerkAuth = (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized. Clerk session invalid.' });
  }

  next();
};

/**
 * requireCustomAuth
 * Checks for the custom backend JWT in Authorization header.
 */
const requireCustomAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Missing token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
  }
};

module.exports = { requireClerkAuth, requireCustomAuth };
