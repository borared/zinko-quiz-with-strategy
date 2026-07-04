const express = require('express');
const shopController = require('../controllers/shopController');
const { requireCustomAuth } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/security');

const router = express.Router();

router.use(requireCustomAuth);

router.get('/catalog', shopController.getCatalog);
router.post('/checkout', writeLimiter, shopController.createCheckout);

module.exports = router;