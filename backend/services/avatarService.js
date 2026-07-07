const avatarRepository = require('../repositories/avatarRepository');

const getAllAvatars = async (userId = null) => {
  return avatarRepository.getAllAvatars();
};

module.exports = {
  getAllAvatars,
};
