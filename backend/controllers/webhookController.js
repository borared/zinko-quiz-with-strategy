const { Webhook } = require('svix');
const userService = require('../services/userService');
const shopService = require('../services/shopService');
const { getStripe } = require('../lib/stripe');

/**
 * Handle POST /api/webhooks/clerk
 * Clerk webhook endpoint for user sync
 */
const handleClerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET is not set in .env');
    return res.status(500).json({ error: 'Webhook secret not configured.' });
  }

  // Verify the webhook signature using svix
  const svix_id        = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers.' });
  }

  let event;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(req.body, {
      'svix-id':        svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('❌ Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature.' });
  }

  const { type, data } = event;
  console.log(`📨 Clerk webhook received: ${type}`);

  try {
    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const user = await userService.upsertUser(data);
        console.log(`✅ User synced to Supabase: ${user.clerk_id}`);
        break;
      }
      case 'user.deleted': {
        await userService.deleteUser(data.id);
        console.log(`🗑️  User deleted from Supabase: ${data.id}`);
        break;
      }
      default:
        console.log(`ℹ️  Unhandled event type: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`❌ Error handling webhook event "${type}":`, err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const handleStripeWebhook = async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripe();

  if (!webhookSecret || !stripe) {
    console.error('❌ Stripe webhook is not configured.');
    return res.status(500).json({ error: 'Stripe webhook not configured.' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header.' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error('❌ Stripe webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid Stripe webhook signature.' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        if (session.payment_status === 'paid' || event.type === 'checkout.session.async_payment_succeeded') {
          const result = await shopService.handleCheckoutCompleted(session);
          if (result && !result.alreadyCompleted) {
            console.log(`✅ Shop purchase fulfilled: ${result.order.item_type}/${result.order.item_slug}`);
          }
        }
        break;
      }
      default:
        console.log(`ℹ️  Unhandled Stripe event: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`❌ Error handling Stripe event "${event.type}":`, err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  handleClerkWebhook,
  handleStripeWebhook,
};
