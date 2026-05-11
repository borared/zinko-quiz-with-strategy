const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/user/dashboard
 * Protected — example of a user-specific protected route.
 */
router.get('/dashboard', requireAuth, (req, res) => {
  res.json({ message: 'Welcome to your dashboard!' });
});

module.exports = router;
