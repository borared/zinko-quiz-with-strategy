const notificationRepository = require('../repositories/notificationRepository');
const sceneryService = require('./sceneryService');
const prisma = require('../lib/prisma');

const createNotification = async (userId, type, message, metadata = null) => {
  return await notificationRepository.createNotification(userId, type, message, metadata);
};

const getNotificationsByUserId = async (userId) => {
  try {
    await sceneryService.ensureWelcomeGifts(userId);
  } catch (error) {
    console.error('Failed to ensure welcome scenery gift:', error.message);
  }

  const notifications = await notificationRepository.getNotificationsByUserId(userId);

  // Dynamically resolve actor details (name and avatar) for friend notifications
  const resolvedNotifications = await Promise.all(
    notifications.map(async (notif) => {
      if (notif.type === 'FRIEND_REQUEST' || notif.type === 'FRIEND_ACCEPTED') {
        const metadata = notif.metadata || {};
        const actorClerkId = metadata.senderClerkId || metadata.acceptorClerkId;
        if (actorClerkId) {
          try {
            const actorUser = await prisma.users.findUnique({
              where: { clerk_id: actorClerkId },
              select: { username: true, first_name: true, avatar_url: true },
            });
            if (actorUser) {
              const actorName = actorUser.username || actorUser.first_name || 'Someone';
              return {
                ...notif,
                metadata: {
                  ...metadata,
                  cloner_name: actorName,
                  cloner_avatar: actorUser.avatar_url || null,
                },
              };
            }
          } catch (e) {
            console.error('Failed to resolve actor details for notification:', e);
          }
        }
      }
      return notif;
    })
  );

  return resolvedNotifications;
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
