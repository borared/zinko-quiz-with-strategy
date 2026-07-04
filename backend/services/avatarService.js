const avatarRepository = require('../repositories/avatarRepository');

const getAllAvatars = async (userId = null) => {
  return avatarRepository.getPlayableAvatars(userId);
};

module.exports = {
  getAllAvatars,
};
