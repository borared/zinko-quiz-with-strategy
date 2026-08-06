/**
 * Production-safe email helper for Zinko.
 *
 * Gmail SMTP on shared hosts (e.g. Render) often fails due to:
 *  - quoted/spaced app passwords in env vars
 *  - wrong From address (must match SMTP_USER for Gmail)
 *  - short connection timeouts / cold starts
 *  - port 587 vs 465 differences per host network
 *
 * This module sanitizes credentials, reuses a transporter, and retries
 * with an alternate port when the first attempt times out.
 */

const nodemailer = require('nodemailer');

/** Strip quotes/spaces that break Gmail app passwords when pasted into host dashboards. */
function sanitizeEnv(value) {
  if (value == null) return '';
  return String(value).trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
}

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getSmtpCredentials() {
  return {
    host: sanitizeEnv(process.env.SMTP_HOST).toLowerCase(),
    user: sanitizeEnv(process.env.SMTP_USER),
    // App passwords are often pasted with spaces; Gmail rejects those.
    pass: sanitizeEnv(process.env.SMTP_PASS).replace(/\s+/g, ''),
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
  };
}

function getFromAddress() {
  const user = sanitizeEnv(process.env.SMTP_USER);
  const rawFrom = process.env.SMTP_FROM?.trim().replace(/^["']|["']$/g, '');
  // Gmail rejects arbitrary From domains; default to the authenticated mailbox.
  return rawFrom || `"Zinko Quiz" <${user}>`;
}

function buildTransportOptions({ host, user, pass, port, secure }) {
  const auth = { user, pass };
  const timeouts = {
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  };

  // Gmail: prefer explicit host/port over service preset so timeouts apply reliably.
  if (host.includes('gmail')) {
    return {
      service: 'gmail',
      auth,
      ...timeouts,
    };
  }

  return {
    host,
    port: port || 587,
    secure: Boolean(secure),
    auth,
    ...timeouts,
  };
}

function createTransporter(overrides = {}) {
  const creds = { ...getSmtpCredentials(), ...overrides };
  if (!creds.host || !creds.user || !creds.pass) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
  }
  return nodemailer.createTransport(buildTransportOptions(creds));
}

let cachedTransporter = null;
let cachedTransporterKey = null;

function getTransporter() {
  const creds = getSmtpCredentials();
  const key = `${creds.host}|${creds.port}|${creds.secure}|${creds.user}|${creds.pass}`;
  if (!cachedTransporter || cachedTransporterKey !== key) {
    cachedTransporter = createTransporter(creds);
    cachedTransporterKey = key;
  }
  return cachedTransporter;
}

function resetTransporter() {
  cachedTransporter = null;
  cachedTransporterKey = null;
}

function isRetryableSmtpError(err) {
  const code = err?.code || '';
  const message = (err?.message || '').toLowerCase();
  return (
    code === 'ETIMEDOUT' ||
    code === 'ESOCKET' ||
    code === 'ECONNECTION' ||
    code === 'ECONNRESET' ||
    code === 'ECONNREFUSED' ||
    message.includes('timeout') ||
    message.includes('greeting') ||
    message.includes('connection')
  );
}

function humanizeSmtpError(err) {
  const code = err?.code || '';
  const responseCode = err?.responseCode;
  const message = err?.message || 'Unknown email error';

  if (code === 'EAUTH' || responseCode === 535) {
    return 'Email login failed. Check SMTP_USER and SMTP_PASS (use a Gmail App Password).';
  }
  if (isRetryableSmtpError(err)) {
    return 'Could not reach the email server (timeout). SMTP may be blocked on this host — try port 465 or a transactional provider.';
  }
  if (responseCode === 550 || responseCode === 553) {
    return 'Email provider rejected the sender address. Set SMTP_FROM to your SMTP_USER address.';
  }
  return `Failed to send email: ${message}`;
}

/**
 * Send an email via configured SMTP.
 * Retries once on timeout using Gmail port 465 if the first attempt used 587.
 *
 * @param {{ to: string, subject: string, html?: string, text?: string, from?: string }} options
 * @returns {Promise<{ messageId?: string, mocked?: boolean }>}
 */
async function sendEmail({ to, subject, html, text, from }) {
  if (!to) throw new Error('Missing recipient email.');
  if (!subject) throw new Error('Missing email subject.');

  if (!isSmtpConfigured()) {
    console.log('[email] SMTP not configured — logging email instead of sending.');
    console.log(`[email] To: ${to} | Subject: ${subject}`);
    if (text) console.log(`[email] Text: ${text}`);
    return { mocked: true };
  }

  const mail = {
    from: from || getFromAddress(),
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await getTransporter().sendMail(mail);
    return { messageId: info.messageId, mocked: false };
  } catch (firstErr) {
    console.error('[email] First send attempt failed:', firstErr.code || firstErr.message);

    const creds = getSmtpCredentials();
    const usedGmail587 = creds.host.includes('gmail') && !creds.secure && creds.port !== 465;

    if (usedGmail587 && isRetryableSmtpError(firstErr)) {
      try {
        console.log('[email] Retrying via smtp.gmail.com:465 (SSL)...');
        resetTransporter();
        const fallback = createTransporter({ port: 465, secure: true });
        cachedTransporter = fallback;
        cachedTransporterKey = `${creds.host}|465|true|${creds.user}|${creds.pass}`;
        const info = await fallback.sendMail(mail);
        return { messageId: info.messageId, mocked: false };
      } catch (retryErr) {
        console.error('[email] Retry via 465 failed:', retryErr.code || retryErr.message);
        const error = new Error(humanizeSmtpError(retryErr));
        error.cause = retryErr;
        throw error;
      }
    }

    const error = new Error(humanizeSmtpError(firstErr));
    error.cause = firstErr;
    throw error;
  }
}

/**
 * Draw It helper — emails the secret word to the host.
 */
async function sendSecretWordEmail({ to, word }) {
  if (!word) throw new Error('Secret word is missing.');

  const safeWord = String(word)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return sendEmail({
    to,
    subject: 'Your Zinko Secret Word! 🤫',
    text: `Shhh... your word to draw is: ${word}\n\nDon't let anyone else see this!`,
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 20px;">
        <h2>Shhh... here is your word to draw:</h2>
        <div style="font-size: 32px; font-weight: 900; color: #1d4ed8; background: #f3f4f6; padding: 20px; border-radius: 12px; display: inline-block;">
          ${safeWord}
        </div>
        <p style="margin-top: 20px; color: #666;">Don't let anyone else see this!</p>
      </div>
    `,
  });
}

module.exports = {
  isSmtpConfigured,
  sendEmail,
  sendSecretWordEmail,
  resetTransporter,
  humanizeSmtpError,
};
