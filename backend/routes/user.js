const express = require('express');
const { requireCustomAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/dashboard', requireCustomAuth, userController.getDashboard);
router.get('/settings', requireCustomAuth, userController.getSettings);
router.patch('/settings', requireCustomAuth, userController.patchSettings);
router.patch('/username', requireCustomAuth, userController.patchUsername);
router.delete('/account', requireCustomAuth, userController.deleteAccount);

module.exports = router;