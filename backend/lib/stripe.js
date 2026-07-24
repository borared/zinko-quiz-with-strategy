const Stripe = require('stripe');

let stripeClient = null;

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
};

const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY?.trim());

module.exports = {
  getStripe,
  isStripeConfigured,
};