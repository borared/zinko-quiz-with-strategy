const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('@clerk/express');

// Optionally require Auth for these endpoints
router.get('/user/:userId', notificationController.getNotificationsByUserId);
router.put('/:id/read', notificationController.markAsRead);
router.put('/user/:userId/read-all', notificationController.markAllAsRead);
router.delete('/user/:userId/clear-all', notificationController.clearAllNotifications);

module.exports = router;
