const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireCustomAuth, requireSelf } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/security');

router.use(requireCustomAuth);

router.get('/user/:userId', requireSelf('userId'), notificationController.getNotificationsByUserId);
router.put('/:id/read', writeLimiter, notificationController.markAsRead);
router.put('/user/:userId/read-all', requireSelf('userId'), writeLimiter, notificationController.markAllAsRead);
router.delete('/user/:userId/clear-all', requireSelf('userId'), writeLimiter, notificationController.clearAllNotifications);

module.exports = router;