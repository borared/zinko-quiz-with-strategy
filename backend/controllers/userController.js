/**
 * Handle GET /api/user/dashboard
 * Protected — example of a user-specific protected route.
 */
const getDashboard = (req, res) => {
  res.json({ message: 'Welcome to your dashboard!' });
};

module.exports = {
  getDashboard,
};
