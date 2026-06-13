const avatarRepository = require('../repositories/avatarRepository');

const getAllAvatars = async () => {
  return await avatarRepository.getAllAvatars();
};

module.exports = {
  getAllAvatars,
};
