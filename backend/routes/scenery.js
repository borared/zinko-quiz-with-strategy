const express = require('express');
const sceneryController = require('../controllers/sceneryController');
const { requireCustomAuth } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/security');

const router = express.Router();

router.use(requireCustomAuth);

router.get('/owned', sceneryController.getOwnedSceneries);
router.post('/collect', writeLimiter, sceneryController.collectScenery);

module.exports = router;