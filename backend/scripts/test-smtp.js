require('dotenv').config();
const { sendSecretWordEmail, isSmtpConfigured } = require('../lib/emailService');

(async () => {
  try {
    console.log('SMTP configured?', isSmtpConfigured());
    const to = process.env.SMTP_USER;
    const result = await sendSecretWordEmail({ to, word: 'penguin' });
    console.log('RESULT', result);
  } catch (e) {
    console.error('FAIL', e.message);
    if (e.cause) console.error('CAUSE', e.cause.message || e.cause);
    process.exitCode = 1;
  }
})();
