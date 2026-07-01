const prisma = require('../lib/prisma');

const ensureCatalog = async () => {
  const catalog = [
    { slug: 'city', name: 'City', image_url: '/background_battle/city.jpg', is_default: true },
    { slug: 'halloween', name: 'Halloween', image_url: '/background_battle/halloween_scenery.jpg', is_default: false },
  ];

  await Promise.all(
    catalog.map((entry) =>
      prisma.sceneries.upsert({
        where: { slug: entry.slug },
        update: {
          name: entry.name,
          image_url: entry.image_url,
          is_default: entry.is_default,
        },
        create: entry,
      })
    )
  );
};

const getBySlug = async (slug) => {
  return prisma.sceneries.findUnique({ where: { slug } });
};

const getOwnedSceneriesForUser = async (userId) => {
  const [defaults, unlocked] = await Promise.all([
    prisma.sceneries.findMany({ where: { is_default: true }, orderBy: { created_at: 'asc' } }),
    prisma.user_sceneries.findMany({
      where: { user_id: userId },
      include: { scenery: true },
      orderBy: { obtained_at: 'asc' },
    }),
  ]);

  const merged = new Map();
  defaults.forEach((scenery) => merged.set(scenery.slug, scenery));
  unlocked.forEach(({ scenery }) => {
    if (scenery) merged.set(scenery.slug, scenery);
  });

  return Array.from(merged.values());
};

const userOwnsSceneryImage = async (userId, imageUrl) => {
  const owned = await getOwnedSceneriesForUser(userId);
  return owned.some((scenery) => scenery.image_url === imageUrl);
};

const grantSceneryToUser = async (userId, sceneryId) => {
  return prisma.user_sceneries.upsert({
    where: {
      user_id_scenery_id: {
        user_id: userId,
        scenery_id: sceneryId,
      },
    },
    update: {},
    create: {
      user_id: userId,
      scenery_id: sceneryId,
    },
  });
};

const userOwnsScenerySlug = async (userId, slug) => {
  const scenery = await getBySlug(slug);
  if (!scenery) return false;
  if (scenery.is_default) return true;

  const owned = await prisma.user_sceneries.findUnique({
    where: {
      user_id_scenery_id: {
        user_id: userId,
        scenery_id: scenery.id,
      },
    },
  });

  return Boolean(owned);
};

module.exports = {
  ensureCatalog,
  getBySlug,
  getOwnedSceneriesForUser,
  userOwnsSceneryImage,
  userOwnsScenerySlug,
  grantSceneryToUser,
};