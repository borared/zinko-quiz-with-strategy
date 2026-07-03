const userRepository = require('../repositories/userRepository');
const handleError = require('../lib/errorHandler');

function respondWithError(res, error, fallbackMessage) {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({ error: error.message || fallbackMessage });
  }
  return handleError(res, fallbackMessage, error);
}

const getSettings = async (req, res) => {
  try {
    const clerkId = req.user.userId;
    const user = await userRepository.getUserSettings(clerkId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const quizCount = await userRepository.countQuizzesByUserId(clerkId);

    res.json({
      user: {
        clerkId: user.clerk_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        avatarUrl: user.avatar_url,
      },
      settings: user.settings,
      usage: {
        quizzesCreated: quizCount,
        plan: 'basic',
      },
    });
  } catch (error) {
    respondWithError(res, error, 'Failed to load settings.');
  }
};

const patchSettings = async (req, res) => {
  try {
    const clerkId = req.user.userId;
    const user = await userRepository.updateUserSettings(clerkId, req.body?.settings || req.body);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        clerkId: user.clerk_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        avatarUrl: user.avatar_url,
      },
      settings: user.settings,
    });
  } catch (error) {
    respondWithError(res, error, 'Failed to update settings.');
  }
};

const patchUsername = async (req, res) => {
  try {
    const clerkId = req.user.userId;
    const user = await userRepository.updateUsername(clerkId, req.body?.username);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        clerkId: user.clerk_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        avatarUrl: user.avatar_url,
      },
      settings: user.settings,
    });
  } catch (error) {
    respondWithError(res, error, 'Failed to update username.');
  }
};

const deleteAccount = async (req, res) => {
  try {
    const clerkId = req.user.userId;
    await userRepository.deleteUser(clerkId);
    res.json({ success: true, message: 'Zinko account data removed. Complete account deletion in Manage Account if needed.' });
  } catch (error) {
    respondWithError(res, error, 'Failed to delete account.');
  }
};

const getDashboard = (req, res) => {
  res.json({ message: 'Welcome to your dashboard!' });
};

module.exports = {
  getDashboard,
  getSettings,
  patchSettings,
  patchUsername,
  deleteAccount,
};