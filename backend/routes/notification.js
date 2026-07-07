const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireCustomAuth, requireSelf } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/security');

router.use(requireCustomAuth);

/**
 * @swagger
 * /api/notifications/user/{userId}:
 *   get:
 *     summary: GET /user/:userId
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/user/:userId', requireSelf('userId'), notificationController.getNotificationsByUserId);
/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: PUT /:id/read
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.put('/:id/read', writeLimiter, notificationController.markAsRead);
/**
 * @swagger
 * /api/notifications/user/{userId}/read-all:
 *   put:
 *     summary: PUT /user/:userId/read-all
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.put('/user/:userId/read-all', requireSelf('userId'), writeLimiter, notificationController.markAllAsRead);
/**
 * @swagger
 * /api/notifications/user/{userId}/clear-all:
 *   delete:
 *     summary: DELETE /user/:userId/clear-all
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.delete('/user/:userId/clear-all', requireSelf('userId'), writeLimiter, notificationController.clearAllNotifications);

module.exports = router;