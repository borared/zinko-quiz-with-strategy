const sceneryRepository = require('../repositories/sceneryRepository');
const notificationRepository = require('../repositories/notificationRepository');
const {
  ZINKO_SENDER,
  SCENERY_GIFT_TYPE,
  HALLOWEEN_SCENERY_SLUG,
} = require('../lib/sceneryConstants');

const giftHalloweenSceneryNotification = async (userId) => {
  await sceneryRepository.ensureCatalog();

  const alreadyOwned = await sceneryRepository.userOwnsScenerySlug(userId, HALLOWEEN_SCENERY_SLUG);
  if (alreadyOwned) return null;

  const hasPendingGift = await notificationRepository.hasPendingSceneryGift(
    userId,
    HALLOWEEN_SCENERY_SLUG
  );
  if (hasPendingGift) return null;

  const scenery = await sceneryRepository.getBySlug(HALLOWEEN_SCENERY_SLUG);
  if (!scenery) return null;

  const message = `gifted you the "${scenery.name}" background scenery! Collect it to use in your host lobby.`;
  const metadata = {
    ...ZINKO_SENDER,
    scenery_slug: scenery.slug,
    scenery_name: scenery.name,
    scenery_image: scenery.image_url,
    collected: false,
  };

  return notificationRepository.createNotification(
    userId,
    SCENERY_GIFT_TYPE,
    message,
    metadata
  );
};

const ensureWelcomeGifts = async (userId) => {
  await sceneryRepository.ensureCatalog();
  return giftHalloweenSceneryNotification(userId);
};

const getOwnedSceneries = async (userId) => {
  await sceneryRepository.ensureCatalog();
  const sceneries = await sceneryRepository.getOwnedSceneriesForUser(userId);
  return sceneries.map((scenery) => ({
    id: scenery.slug,
    slug: scenery.slug,
    name: scenery.name,
    image: scenery.image_url,
    is_default: scenery.is_default,
  }));
};

const collectSceneryFromNotification = async (userId, notificationId) => {
  const notification = await notificationRepository.getNotificationById(notificationId, userId);
  if (!notification) {
    throw new Error('Notification not found.');
  }
  if (notification.type !== SCENERY_GIFT_TYPE) {
    throw new Error('This notification cannot be collected.');
  }

  const metadata = notification.metadata || {};
  if (metadata.collected === true) {
    throw new Error('Scenery already collected.');
  }

  const scenerySlug = metadata.scenery_slug;
  if (!scenerySlug) {
    throw new Error('Invalid scenery gift.');
  }

  const scenery = await sceneryRepository.getBySlug(scenerySlug);
  if (!scenery) {
    throw new Error('Scenery no longer exists.');
  }

  await sceneryRepository.grantSceneryToUser(userId, scenery.id);
  await notificationRepository.updateNotificationMetadata(notificationId, userId, {
    ...metadata,
    collected: true,
    collected_at: new Date().toISOString(),
  });
  await notificationRepository.markAsRead(notificationId, userId);

  return {
    scenery: {
      id: scenery.slug,
      slug: scenery.slug,
      name: scenery.name,
      image: scenery.image_url,
      is_default: scenery.is_default,
    },
    notificationId,
  };
};

const userOwnsSceneryImage = async (userId, imageUrl) => {
  await sceneryRepository.ensureCatalog();
  return sceneryRepository.userOwnsSceneryImage(userId, imageUrl);
};

module.exports = {
  ensureWelcomeGifts,
  giftHalloweenSceneryNotification,
  getOwnedSceneries,
  collectSceneryFromNotification,
  userOwnsSceneryImage,
};