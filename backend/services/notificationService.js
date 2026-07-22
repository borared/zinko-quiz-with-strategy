const notificationRepository = require('../repositories/notificationRepository');
const sceneryService = require('./sceneryService');

const createNotification = async (userId, type, message, metadata = null) => {
  return await notificationRepository.createNotification(userId, type, message, metadata);
};

const getNotificationsByUserId = async (userId) => {
  try {
    await sceneryService.ensureWelcomeGifts(userId);
  } catch (error) {
    console.error('Failed to ensure welcome scenery gift:', error.message);
  }

  return await notificationRepository.getNotificationsByUserId(userId);
};

const markAsRead = async (id, userId) => {
  return await notificationRepository.markAsRead(id, userId);
};

const markAllAsRead = async (userId) => {
  await notificationRepository.markAllAsRead(userId);
};

const clearAllNotifications = async (userId) => {
  await notificationRepository.clearAllNotifications(userId);
};

const deleteNotification = async (id, userId) => {
  return await notificationRepository.deleteNotification(id, userId);
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  deleteNotification
};
