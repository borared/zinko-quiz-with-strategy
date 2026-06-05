const express = require('express');
const router = express.Router();
const { getAvatars } = require('../controllers/avatarController');

// GET /api/avatars
router.get('/', getAvatars);

module.exports = router;
