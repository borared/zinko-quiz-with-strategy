const avatarService = require('../services/avatarService');

const getAvatars = async (req, res) => {
  try {
    const avatars = await avatarService.getAllAvatars(req.user?.userId ?? null);
    res.status(200).json({ success: true, data: avatars });
  } catch (error) {
    console.error('Error fetching avatars:', error.message);
    res.status(500).json({ success: false, message: 'Server Error: Unable to fetch avatars' });
  }
};

module.exports = {
  getAvatars
};
