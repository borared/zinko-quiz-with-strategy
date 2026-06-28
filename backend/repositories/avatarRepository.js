const prisma = require('../lib/prisma');

const AvatarRepository = {
  getAllAvatars: async () => {
    return prisma.avatars.findMany({
      orderBy: { created_at: 'asc' },
    });
  },
};

module.exports = AvatarRepository;