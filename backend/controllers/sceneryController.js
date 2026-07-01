const sceneryService = require('../services/sceneryService');

const handleError = (res, message, err, status = 500) => {
  console.error(message, err?.message || err);
  res.status(status).json({ error: err?.message || message });
};

const getOwnedSceneries = async (req, res) => {
  try {
    const sceneries = await sceneryService.getOwnedSceneries(req.user.userId);
    res.json({ sceneries });
  } catch (err) {
    handleError(res, 'Failed to fetch owned scenery', err);
  }
};

const collectScenery = async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (!notificationId) {
      return res.status(400).json({ error: 'notificationId is required.' });
    }

    const result = await sceneryService.collectSceneryFromNotification(
      req.user.userId,
      notificationId
    );
    res.json(result);
  } catch (err) {
    const status = /not found|already collected|cannot be collected|invalid/i.test(err.message)
      ? 400
      : 500;
    handleError(res, 'Failed to collect scenery', err, status);
  }
};

module.exports = {
  getOwnedSceneries,
  collectScenery,
};