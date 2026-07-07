const express = require('express');
const sceneryController = require('../controllers/sceneryController');
const { requireCustomAuth } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/security');

const router = express.Router();

router.use(requireCustomAuth);

/**
 * @swagger
 * /api/sceneries/owned:
 *   get:
 *     summary: GET /owned
 *     tags: [Scenery]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/owned', sceneryController.getOwnedSceneries);
/**
 * @swagger
 * /api/sceneries/collect:
 *   post:
 *     summary: POST /collect
 *     tags: [Scenery]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/collect', writeLimiter, sceneryController.collectScenery);

module.exports = router;