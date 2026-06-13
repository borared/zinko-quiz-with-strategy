const userRepository = require('../repositories/userRepository');

/**
 * Service: Handles business logic for users
 */
const upsertUser = async (clerkUser) => {
  // Parsing and mapping the webhook data structure can be considered business logic
  return await userRepository.upsertUser(clerkUser);
};

const deleteUser = async (clerkId) => {
  return await userRepository.deleteUser(clerkId);
};

module.exports = {
  upsertUser,
  deleteUser,
};
