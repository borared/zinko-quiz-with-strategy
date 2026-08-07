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
        coverUrl: user.cover_url,
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
        coverUrl: user.cover_url,
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
        coverUrl: user.cover_url,
      },
      settings: user.settings,
    });
  } catch (error) {
    respondWithError(res, error, 'Failed to update username.');
  }
};

const patchCover = async (req, res) => {
  try {
    const clerkId = req.user.userId;
    const { coverUrl } = req.body;

    const user = await userRepository.updateUserCover(clerkId, coverUrl || null);

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
        coverUrl: user.cover_url,
      },
      settings: user.settings,
    });
  } catch (error) {
    respondWithError(res, error, 'Failed to update cover photo.');
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

const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    const profile = await userRepository.getPublicProfileByIdentifier(username);

    if (!profile) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        clerkId: profile.clerk_id,
        username: profile.username,
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatarUrl: profile.avatar_url,
        coverUrl: profile.cover_url,
        createdAt: profile.created_at,
      },
      quizzes: profile.quizzes,
      friends: profile.friends || [],
      stats: {
        totalPublicQuizzes: profile.quizzes.length,
        followers: profile.friendsCount || 0,
        following: profile.friendsCount || 0
      }
    });
  } catch (error) {
    respondWithError(res, error, 'Failed to fetch public profile.');
  }
};

module.exports = {
  getDashboard,
  getSettings,
  patchSettings,
  patchUsername,
  patchCover,
  deleteAccount,
  getPublicProfile,
};