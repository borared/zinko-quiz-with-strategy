const prisma = require('../lib/prisma');
const sceneryRepository = require('./sceneryRepository');
const { SCENERY_PRICES_CENTS, SHOP_CURRENCY } = require('../lib/shopConstants');

const getOwnedScenerySlugs = async (userId) => {
  if (!userId) return new Set();
  const owned = await sceneryRepository.getOwnedSceneriesForUser(userId);
  return new Set(owned.map((scenery) => scenery.slug));
};

const getOwnedAvatarSlugs = async (userId) => {
  if (!userId) return new Set();
  const rows = await prisma.user_avatars.findMany({
    where: { user_id: userId },
    include: { avatar: { select: { slug: true } } },
  });
  return new Set(rows.map((row) => row.avatar?.slug).filter(Boolean));
};

const mapSceneryItem = (scenery, ownedScenerySlugs) => ({
  id: scenery.slug,
  slug: scenery.slug,
  name: scenery.name,
  image: scenery.image_url,
  price_cents: scenery.price_cents ?? SCENERY_PRICES_CENTS[scenery.slug] ?? 0,
  currency: SHOP_CURRENCY,
  owned: ownedScenerySlugs.has(scenery.slug),
  item_type: 'scenery',
});

const mapAvatarItem = (avatar, ownedAvatarSlugs) => ({
  id: avatar.slug,
  slug: avatar.slug,
  name: avatar.label,
  image: avatar.image_url,
  price_cents: avatar.price_cents,
  currency: SHOP_CURRENCY,
  owned: ownedAvatarSlugs.has(avatar.slug),
  item_type: 'avatar',
});

const getShopCatalog = async (userId) => {
  await sceneryRepository.ensureCatalog();

  const [sceneries, avatars, ownedScenerySlugs, ownedAvatarSlugs] = await Promise.all([
    prisma.sceneries.findMany({
      where: { is_purchasable: true },
      orderBy: { created_at: 'asc' },
    }),
    prisma.avatars.findMany({
      where: { is_purchasable: true },
      orderBy: { created_at: 'asc' },
    }),
    getOwnedScenerySlugs(userId),
    getOwnedAvatarSlugs(userId),
  ]);

  return {
    sceneries: sceneries.map((scenery) => mapSceneryItem(scenery, ownedScenerySlugs)),
    avatars: avatars.map((avatar) => mapAvatarItem(avatar, ownedAvatarSlugs)),
  };
};

const getPurchasableItem = async (itemType, slug) => {
  await sceneryRepository.ensureCatalog();

  if (itemType === 'scenery') {
    const scenery = await prisma.sceneries.findUnique({ where: { slug } });
    if (!scenery || !scenery.is_purchasable || scenery.is_default) {
      throw new Error('This scenery is not available for purchase.');
    }

    return {
      itemType: 'scenery',
      slug: scenery.slug,
      name: scenery.name,
      image: scenery.image_url,
      priceCents: scenery.price_cents ?? SCENERY_PRICES_CENTS[scenery.slug] ?? 0,
      recordId: scenery.id,
    };
  }

  if (itemType === 'avatar') {
    const avatar = await prisma.avatars.findUnique({ where: { slug } });
    if (!avatar || !avatar.is_purchasable || avatar.is_free) {
      throw new Error('This avatar is not available for purchase.');
    }

    return {
      itemType: 'avatar',
      slug: avatar.slug,
      name: avatar.label,
      image: avatar.image_url,
      priceCents: avatar.price_cents,
      recordId: avatar.id,
    };
  }

  throw new Error('Invalid item type.');
};

const userOwnsItem = async (userId, itemType, slug) => {
  if (itemType === 'scenery') {
    const slugs = await getOwnedScenerySlugs(userId);
    return slugs.has(slug);
  }

  const slugs = await getOwnedAvatarSlugs(userId);
  return slugs.has(slug);
};

const createPendingOrder = async (userId, itemType, slug, amountCents) => {
  return prisma.shop_orders.create({
    data: {
      user_id: userId,
      item_type: itemType,
      item_slug: slug,
      amount_cents: amountCents,
      currency: SHOP_CURRENCY,
      status: 'pending',
    },
  });
};

const attachStripeSession = async (orderId, stripeSessionId) => {
  return prisma.shop_orders.update({
    where: { id: orderId },
    data: { stripe_session_id: stripeSessionId },
  });
};

const grantItemOwnership = async (tx, userId, itemType, slug) => {
  if (itemType === 'scenery') {
    const scenery = await tx.sceneries.findUnique({ where: { slug } });
    if (!scenery) throw new Error('Scenery no longer exists.');

    await tx.user_sceneries.upsert({
      where: {
        user_id_scenery_id: {
          user_id: userId,
          scenery_id: scenery.id,
        },
      },
      update: {},
      create: {
        user_id: userId,
        scenery_id: scenery.id,
      },
    });

    return mapSceneryItem(scenery, new Set([slug]));
  }

  const avatar = await tx.avatars.findUnique({ where: { slug } });
  if (!avatar) throw new Error('Avatar no longer exists.');

  await tx.user_avatars.upsert({
    where: {
      user_id_avatar_id: {
        user_id: userId,
        avatar_id: avatar.id,
      },
    },
    update: {},
    create: {
      user_id: userId,
      avatar_id: avatar.id,
    },
  });

  return mapAvatarItem(avatar, new Set([slug]));
};

const completeOrderBySessionId = async (stripeSessionId, stripePaymentIntent = null) => {
  const order = await prisma.shop_orders.findUnique({
    where: { stripe_session_id: stripeSessionId },
  });

  if (!order) {
    throw new Error('Shop order not found for Stripe session.');
  }

  if (order.status === 'completed') {
    return { alreadyCompleted: true, order };
  }

  return prisma.$transaction(async (tx) => {
    const item = await grantItemOwnership(tx, order.user_id, order.item_type, order.item_slug);

    const completedOrder = await tx.shop_orders.update({
      where: { id: order.id },
      data: {
        status: 'completed',
        stripe_payment_intent: stripePaymentIntent,
        completed_at: new Date(),
      },
    });

    return { alreadyCompleted: false, order: completedOrder, item };
  });
};

module.exports = {
  getShopCatalog,
  getPurchasableItem,
  userOwnsItem,
  createPendingOrder,
  attachStripeSession,
  completeOrderBySessionId,
  getOwnedAvatarSlugs,
};