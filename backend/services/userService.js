const userRepository = require('../repositories/userRepository');
const sceneryService = require('./sceneryService');

/**
 * Service: Handles business logic for users
 */
const upsertUser = async (clerkUser) => {
  const { user, isNew } = await userRepository.upsertUser(clerkUser);

  if (isNew) {
    try {
      await sceneryService.ensureWelcomeGifts(user.clerk_id);
    } catch (error) {
      console.error('Failed to send welcome scenery gift:', error.message);
    }
  }

  return user;
};

const syncUserAndWelcomeGifts = async (clerkUser) => {
  const user = await upsertUser(clerkUser);

  try {
    await sceneryService.ensureWelcomeGifts(user.clerk_id);
  } catch (error) {
    console.error('Failed to ensure welcome scenery gift:', error.message);
  }

  return user;
};

const deleteUser = async (clerkId) => {
  return await userRepository.deleteUser(clerkId);
};

module.exports = {
  upsertUser,
  syncUserAndWelcomeGifts,
  deleteUser,
};
