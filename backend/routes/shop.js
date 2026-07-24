const express = require('express');
const shopController = require('../controllers/shopController');
const { requireCustomAuth, optionalCustomAuth } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/security');

const router = express.Router();

/**
 * @swagger
 * /api/shop/catalog:
 *   get:
 *     summary: GET /catalog
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/catalog', optionalCustomAuth, shopController.getCatalog);
/**
 * @swagger
 * /api/shop/checkout:
 *   post:
 *     summary: POST /checkout
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/checkout', requireCustomAuth, writeLimiter, shopController.createCheckout);

module.exports = router;