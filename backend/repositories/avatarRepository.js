const prisma = require('../lib/prisma');

function normalizeAvatarRow(avatar) {
  if (!avatar) return avatar;
  return {
    ...avatar,
    price_cents: Number.isInteger(avatar.price_cents) ? avatar.price_cents : 0,
    price_coins: Number.isInteger(avatar.price_coins) ? avatar.price_coins : 0,
  };
}

const AvatarRepository = {
  getAllAvatars: async () => {
    return prisma.avatars.findMany({
      orderBy: { created_at: 'asc' },
    });
  },

  getPlayableAvatars: async (userId = null) => {
    const [freeAvatars, ownedAvatars] = await Promise.all([
      prisma.avatars.findMany({
        where: { is_free: true },
        orderBy: { created_at: 'asc' },
      }),
      userId
        ? prisma.user_avatars.findMany({
            where: { user_id: userId },
            include: { avatar: true },
            orderBy: { obtained_at: 'asc' },
          })
        : Promise.resolve([]),
    ]);

    const merged = new Map();
    freeAvatars.forEach((avatar) => merged.set(avatar.id, avatar));
    ownedAvatars.forEach(({ avatar }) => {
      if (avatar) merged.set(avatar.id, avatar);
    });

    const playable = Array.from(merged.values()).map(normalizeAvatarRow);
    if (playable.length > 0) return playable;

    const fallback = await prisma.avatars.findMany({
      orderBy: { created_at: 'asc' },
    });
    return fallback.map(normalizeAvatarRow);
  },
};

module.exports = AvatarRepository;