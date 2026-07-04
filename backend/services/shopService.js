const shopRepository = require('../repositories/shopRepository');
const { getStripe, isStripeConfigured } = require('../lib/stripe');
const { SHOP_CURRENCY } = require('../lib/shopConstants');

const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL || 'http://localhost:3000';
  return url.replace(/\/$/, '');
};

const getCatalog = async (userId) => {
  return shopRepository.getShopCatalog(userId);
};

const createCheckoutSession = async (userId, itemType, slug) => {
  if (!itemType || !slug) {
    throw new Error('itemType and slug are required.');
  }

  const normalizedType = String(itemType).toLowerCase();
  if (normalizedType !== 'scenery' && normalizedType !== 'avatar') {
    throw new Error('itemType must be scenery or avatar.');
  }

  if (!isStripeConfigured()) {
    throw new Error('Card payments are not configured yet. Add STRIPE_SECRET_KEY to the backend.');
  }

  const stripe = getStripe();
  const item = await shopRepository.getPurchasableItem(normalizedType, slug);

  if (item.priceCents <= 0) {
    throw new Error('This item does not have a valid price.');
  }

  const alreadyOwned = await shopRepository.userOwnsItem(userId, normalizedType, slug);
  if (alreadyOwned) {
    throw new Error('You already own this item.');
  }

  const order = await shopRepository.createPendingOrder(
    userId,
    normalizedType,
    slug,
    item.priceCents
  );

  const frontendUrl = getFrontendUrl();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: SHOP_CURRENCY,
          unit_amount: item.priceCents,
          product_data: {
            name: `${item.name} — Zinko Shop`,
            description:
              normalizedType === 'scenery'
                ? 'Unlock this lobby background for your host games.'
                : 'Unlock this player avatar for your games.',
            images: item.image ? [item.image] : undefined,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      itemType: normalizedType,
      itemSlug: slug,
      orderId: order.id,
    },
    client_reference_id: userId,
    success_url: `${frontendUrl}/shop?purchase=success&item=${encodeURIComponent(slug)}&type=${normalizedType}`,
    cancel_url: `${frontendUrl}/shop?purchase=canceled`,
  });

  await shopRepository.attachStripeSession(order.id, session.id);

  if (!session.url) {
    throw new Error('Stripe checkout session could not be created.');
  }

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  };
};

const handleCheckoutCompleted = async (session) => {
  if (!session?.id) return null;
  return shopRepository.completeOrderBySessionId(
    session.id,
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
  );
};

module.exports = {
  getCatalog,
  createCheckoutSession,
  handleCheckoutCompleted,
};