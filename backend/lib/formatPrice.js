const formatPrice = (cents, currency = 'usd') => {
  const amount = Number(cents) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

module.exports = { formatPrice };