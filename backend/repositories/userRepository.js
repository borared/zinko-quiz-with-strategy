const prisma = require('../lib/prisma');

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

  return prisma.users.upsert({
    where: { clerk_id: clerkUser.id },
    update: {
      email: primaryEmail,
      first_name: clerkUser.first_name || clerkUser.firstName || null,
      last_name: clerkUser.last_name || clerkUser.lastName || null,
      username: clerkUser.username || null,
      avatar_url: clerkUser.image_url || clerkUser.imageUrl || null,
      updated_at: new Date(),
    },
    create: {
      clerk_id: clerkUser.id,
      email: primaryEmail,
      first_name: clerkUser.first_name || clerkUser.firstName || null,
      last_name: clerkUser.last_name || clerkUser.lastName || null,
      username: clerkUser.username || null,
      avatar_url: clerkUser.image_url || clerkUser.imageUrl || null,
    },
  });
};

/**
 * Delete a user by their Clerk ID.
 */
const deleteUser = async (clerkId) => {
  await prisma.users.deleteMany({
    where: { clerk_id: clerkId },
  });
};

const getUserByClerkId = async (clerkId) => {
  return prisma.users.findUnique({
    where: { clerk_id: clerkId },
  });
};

module.exports = { upsertUser, deleteUser, getUserByClerkId };