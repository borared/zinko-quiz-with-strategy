const express = require('express');
const { requireAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * GET /api/user/dashboard
 * Protected — example of a user-specific protected route.
 */
router.get('/dashboard', requireAuth, userController.getDashboard);

module.exports = router;
