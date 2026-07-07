const express = require('express');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

/**
 * POST /api/webhooks/clerk
 */
/**
 * @swagger
 * /api/webhooks/clerk:
 *   post:
 *     summary: POST /clerk
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/clerk', express.raw({ type: 'application/json' }), webhookController.handleClerkWebhook);
/**
 * @swagger
 * /api/webhooks/stripe:
 *   post:
 *     summary: POST /stripe
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/stripe', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);

module.exports = router;
