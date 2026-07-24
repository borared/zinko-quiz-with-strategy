/**
 * Simple error response helper for Express routes.
 * Logs the error with a consistent prefix and sends a 500 JSON response.
 */
module.exports = function handleError(res, prefix, err) {
  console.error(`${prefix}:`, err?.message || err);

  if (err?.code === 'P2028') {
    return res.status(500).json({
      error: 'Quiz update timed out. Try saving again, or split into fewer questions per round.',
    });
  }

  const devMessage = process.env.NODE_ENV !== 'production' ? err?.message : undefined;
  res.status(500).json({
    error: prefix,
    ...(devMessage ? { message: devMessage } : {}),
  });
};
