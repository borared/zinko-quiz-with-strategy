const notificationService = require('../services/notificationService');
const handleError = require('../lib/errorHandler');

const getNotificationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await notificationService.getNotificationsByUserId(userId);
    res.json(notifications);
  } catch (err) {
    handleError(res, 'Failed to fetch notifications', err);
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(id);
    res.json({ success: true });
  } catch (err) {
    handleError(res, 'Failed to mark notification as read', err);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await notificationService.markAllAsRead(userId);
    res.json({ success: true });
  } catch (err) {
    handleError(res, 'Failed to mark all notifications as read', err);
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    await notificationService.clearAllNotifications(userId);
    res.json({ success: true });
  } catch (err) {
    handleError(res, 'Failed to clear notifications', err);
  }
};

module.exports = {
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
  clearAllNotifications
};
