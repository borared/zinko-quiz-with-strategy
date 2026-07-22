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

const getNotificationById = async (id, userId) => {
  return prisma.notifications.findFirst({
    where: { id, user_id: userId },
  });
};

const hasPendingSceneryGift = async (userId, scenerySlug) => {
  const notifications = await prisma.notifications.findMany({
    where: {
      user_id: userId,
      type: 'SCENERY_GIFT',
    },
    orderBy: { created_at: 'desc' },
    take: 50,
  });

  return notifications.some((notification) => {
    const metadata = notification.metadata || {};
    return metadata.scenery_slug === scenerySlug && metadata.collected !== true;
  });
};

const updateNotificationMetadata = async (id, userId, metadata) => {
  const notification = await getNotificationById(id, userId);
  if (!notification) return null;

  return prisma.notifications.update({
    where: { id },
    data: { metadata },
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

const deleteNotification = async (id, userId) => {
  const result = await prisma.notifications.deleteMany({
    where: { id, user_id: userId },
  });
  return result.count > 0;
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  getNotificationById,
  hasPendingSceneryGift,
  updateNotificationMetadata,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  deleteNotification,
};