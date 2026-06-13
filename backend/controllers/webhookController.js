const { Webhook } = require('svix');
const userService = require('../services/userService');

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

module.exports = {
  handleClerkWebhook,
};
