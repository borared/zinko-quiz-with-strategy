const AvatarModel = require('../models/avatarModel');

const getAvatars = async (req, res) => {
  try {
    const avatars = await AvatarModel.getAllAvatars();
    res.status(200).json({ success: true, data: avatars });
  } catch (error) {
    console.error('Error fetching avatars:', error.message);
    res.status(500).json({ success: false, message: 'Server Error: Unable to fetch avatars' });
  }
};

module.exports = {
  getAvatars
};
