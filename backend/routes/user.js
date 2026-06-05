const express = require('express');
const { requireCustomAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * GET /api/user/dashboard
 * Protected — example of a user-specific protected route.
 */
router.get('/dashboard', requireCustomAuth, userController.getDashboard);

module.exports = router;
