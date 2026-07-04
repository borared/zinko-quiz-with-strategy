const express = require('express');
const router = express.Router();
const { getAvatars } = require('../controllers/avatarController');
const { optionalCustomAuth } = require('../middleware/auth');

// GET /api/avatars
router.get('/', optionalCustomAuth, getAvatars);

module.exports = router;
