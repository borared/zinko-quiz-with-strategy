const { getAuth, clerkClient } = require('@clerk/express');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

/**
 * Handle POST /api/auth/token
 * Generates a custom JWT after successful Clerk auth.
 */
const generateToken = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Clerk session invalid.' });
    }

    // Auto-Sync Fallback: Fetch user from Clerk API and upsert into Supabase.
    // This ensures the user is saved even if local Webhooks drop!
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      await userService.upsertUser(clerkUser);
      console.log(`✅ Auto-Sync successful for user: ${userId}`);
    } catch (syncErr) {
      console.error('⚠️ Auto-Sync failed, but continuing token generation:', syncErr.message);
    }

    const payload = { userId };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token });
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

/**
 * Handle GET /api/auth/me
 * Public — returns the current user's Clerk userId if signed in, or null.
 */
const getMe = (req, res) => {
  const { userId } = getAuth(req);
  res.json({ userId: userId || null });
};

/**
 * Handle GET /api/auth/profile
 * Protected — returns the authenticated user's info from the custom JWT.
 */
const getProfile = (req, res) => {
  res.json({
    message: 'Authenticated via custom JWT successfully.',
    userId: req.user?.userId,
  });
};

module.exports = {
  getMe,
  getProfile,
  generateToken,
};
