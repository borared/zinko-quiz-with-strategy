const express = require('express');
const shopController = require('../controllers/shopController');
const { requireCustomAuth } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/security');

const router = express.Router();

router.use(requireCustomAuth);

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
router.get('/catalog', shopController.getCatalog);
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
router.post('/checkout', writeLimiter, shopController.createCheckout);

module.exports = router;