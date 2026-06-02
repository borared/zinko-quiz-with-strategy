const express = require('express');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

/**
 * POST /api/webhooks/clerk
 */
router.post('/clerk', express.raw({ type: 'application/json' }), webhookController.handleClerkWebhook);

module.exports = router;
