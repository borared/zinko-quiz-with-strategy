const prisma = require('../lib/prisma');
const { mergeSettings, sanitizePatch } = require('../lib/userSettings');

/**
 * Upsert a user into the database.
 * Called when Clerk fires user.created or user.updated.
 */
const upsertUser = async (clerkUser) => {
  let primaryEmail = null;

  if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
    const primaryEmailObj = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    );
    primaryEmail = primaryEmailObj?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;
  } else if (clerkUser.email_addresses && clerkUser.email_addresses.length > 0) {
    const primaryEmailObj = clerkUser.email_addresses.find(
      (e) => e.id === clerkUser.primary_email_address_id
    );
    primaryEmail = primaryEmailObj?.email_address || clerkUser.email_addresses[0]?.email_address;
  }

  const existing = await prisma.users.findUnique({
    where: { clerk_id: clerkUser.id },
    select: { clerk_id: true },
  });

  const user = await prisma.users.upsert({
    where: { clerk_id: clerkUser.id },
    update: {
      email: primaryEmail,
      first_name: clerkUser.first_name || clerkUser.firstName || null,
      last_name: clerkUser.last_name || clerkUser.lastName || null,
      avatar_url: clerkUser.image_url || clerkUser.imageUrl || null,
      updated_at: new Date(),
    },
    create: {
      clerk_id: clerkUser.id,
      email: primaryEmail,
      first_name: clerkUser.first_name || clerkUser.firstName || null,
      last_name: clerkUser.last_name || clerkUser.lastName || null,
      avatar_url: clerkUser.image_url || clerkUser.imageUrl || null,
    },
  });

  return { user, isNew: !existing };
};

/**
 * Delete a user by their Clerk ID.
 */
const deleteUser = async (clerkId) => {
  await prisma.$transaction(async (tx) => {
    await tx.quizzes.deleteMany({ where: { creator_id: clerkId } });
    await tx.users.delete({ where: { clerk_id: clerkId } });
  });
};

const getUserByClerkId = async (clerkId) => {
  return prisma.users.findUnique({
    where: { clerk_id: clerkId },
  });
};

const countQuizzesByUserId = async (clerkId) => {
  return prisma.quizzes.count({
    where: { creator_id: clerkId },
  });
};

const getUserSettings = async (clerkId) => {
  const user = await prisma.users.findUnique({
    where: { clerk_id: clerkId },
    select: {
      clerk_id: true,
      email: true,
      first_name: true,
      last_name: true,
      username: true,
      avatar_url: true,
      settings: true,
    },
  });

  if (!user) return null;

  return {
    ...user,
    settings: mergeSettings(user.settings),
  };
};

const updateUserSettings = async (clerkId, patch = {}) => {
  const current = await getUserSettings(clerkId);
  if (!current) return null;

  const sanitized = sanitizePatch(patch);
  const merged = mergeSettings({
    ...current.settings,
    ...sanitized,
    notifications: {
      ...current.settings.notifications,
      ...(sanitized.notifications || {}),
    },
    privacy: {
      ...current.settings.privacy,
      ...(sanitized.privacy || {}),
    },
  });

  const user = await prisma.users.update({
    where: { clerk_id: clerkId },
    data: {
      settings: merged,
      updated_at: new Date(),
    },
    select: {
      clerk_id: true,
      email: true,
      first_name: true,
      last_name: true,
      username: true,
      avatar_url: true,
      settings: true,
    },
  });

  return {
    ...user,
    settings: mergeSettings(user.settings),
  };
};

const updateUsername = async (clerkId, username) => {
  const normalized = String(username || '').trim().toLowerCase();
  if (!normalized || normalized.length < 3 || normalized.length > 24) {
    const error = new Error('Username must be 3-24 characters.');
    error.statusCode = 400;
    throw error;
  }
  if (!/^[a-z0-9_]+$/.test(normalized)) {
    const error = new Error('Username can only use letters, numbers, and underscores.');
    error.statusCode = 400;
    throw error;
  }

  const taken = await prisma.users.findFirst({
    where: {
      username: normalized,
      NOT: { clerk_id: clerkId },
    },
    select: { clerk_id: true },
  });

  if (taken) {
    const error = new Error('Username is already taken.');
    error.statusCode = 409;
    throw error;
  }

  try {
    const user = await prisma.users.upsert({
      where: { clerk_id: clerkId },
      update: {
        username: normalized,
        updated_at: new Date(),
      },
      create: {
        clerk_id: clerkId,
        username: normalized,
      },
      select: {
        clerk_id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        avatar_url: true,
        settings: true,
      },
    });

    return {
      ...user,
      settings: mergeSettings(user.settings),
    };
  } catch (error) {
    if (error?.code === 'P2002') {
      const takenError = new Error('Username is already taken.');
      takenError.statusCode = 409;
      throw takenError;
    }
    throw error;
  }
};

module.exports = {
  upsertUser,
  deleteUser,
  getUserByClerkId,
  countQuizzesByUserId,
  getUserSettings,
  updateUserSettings,
  updateUsername,
};