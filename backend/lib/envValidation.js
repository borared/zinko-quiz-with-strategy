/**
 * Validates required environment variables at startup.
 * Fails fast in production; warns in development.
 */

const REQUIRED_ALWAYS = ['JWT_SECRET', 'DATABASE_URL', 'CLERK_SECRET_KEY'];

const REQUIRED_PRODUCTION = ['CLERK_WEBHOOK_SECRET', 'FRONTEND_URL'];

function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing = [];

  for (const key of REQUIRED_ALWAYS) {
    if (!process.env[key]?.trim()) missing.push(key);
  }

  if (isProduction) {
    for (const key of REQUIRED_PRODUCTION) {
      if (!process.env[key]?.trim()) missing.push(key);
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters for production security.');
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    if (isProduction) {
      throw new Error(message);
    }
    console.warn(`⚠️  ${message}`);
  }
}

module.exports = { validateEnv };