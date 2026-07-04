const prisma = require('../lib/prisma');

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

    const playable = Array.from(merged.values());
    if (playable.length > 0) return playable;

    return prisma.avatars.findMany({
      orderBy: { created_at: 'asc' },
    });
  },
};

module.exports = AvatarRepository;