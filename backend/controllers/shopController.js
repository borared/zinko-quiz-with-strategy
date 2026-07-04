const shopService = require('../services/shopService');

const handleError = (res, message, err, status = 500) => {
  console.error(message, err?.message || err);
  const clientMessage = /already own|not available|invalid|required|not configured|valid price/i.test(
    err?.message
  )
    ? err.message
    : message;
  res.status(status).json({ error: clientMessage });
};

const getCatalog = async (req, res) => {
  try {
    const catalog = await shopService.getCatalog(req.user.userId);
    res.json(catalog);
  } catch (err) {
    handleError(res, 'Failed to fetch shop catalog', err);
  }
};

const createCheckout = async (req, res) => {
  try {
    const { itemType, slug } = req.body;
    const result = await shopService.createCheckoutSession(req.user.userId, itemType, slug);
    res.json(result);
  } catch (err) {
    const status = /already own|not available|invalid|required|not configured|valid price/i.test(
      err?.message
    )
      ? 400
      : 500;
    handleError(res, 'Failed to start checkout', err, status);
  }
};

module.exports = {
  getCatalog,
  createCheckout,
};