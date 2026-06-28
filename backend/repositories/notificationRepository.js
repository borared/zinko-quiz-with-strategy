const prisma = require('../lib/prisma');

const createNotification = async (userId, type, message, metadata = null) => {
  return prisma.notifications.create({
    data: {
      user_id: userId,
      type,
      message,
      metadata,
      is_read: false,
    },
  });
};

const getNotificationsByUserId = async (userId) => {
  return prisma.notifications.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 50,
  });
};

const markAsRead = async (id, userId) => {
  const result = await prisma.notifications.updateMany({
    where: { id, user_id: userId },
    data: { is_read: true },
  });
  return result.count > 0;
};

const markAllAsRead = async (userId) => {
  await prisma.notifications.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true },
  });
};

const clearAllNotifications = async (userId) => {
  await prisma.notifications.deleteMany({
    where: { user_id: userId },
  });
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
};