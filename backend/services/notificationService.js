const notificationRepository = require('../repositories/notificationRepository');

const createNotification = async (userId, type, message, metadata = null) => {
  return await notificationRepository.createNotification(userId, type, message, metadata);
};

const getNotificationsByUserId = async (userId) => {
  return await notificationRepository.getNotificationsByUserId(userId);
};

const markAsRead = async (id) => {
  await notificationRepository.markAsRead(id);
};

const markAllAsRead = async (userId) => {
  await notificationRepository.markAllAsRead(userId);
};

const clearAllNotifications = async (userId) => {
  await notificationRepository.clearAllNotifications(userId);
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
  clearAllNotifications
};
