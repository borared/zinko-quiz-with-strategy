const express = require('express');
const { requireCustomAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /api/user/dashboard:
 *   get:
 *     summary: GET /dashboard
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/dashboard', requireCustomAuth, userController.getDashboard);
/**
 * @swagger
 * /api/user/settings:
 *   get:
 *     summary: GET /settings
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/settings', requireCustomAuth, userController.getSettings);
/**
 * @swagger
 * /api/user/settings:
 *   patch:
 *     summary: PATCH /settings
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.patch('/settings', requireCustomAuth, userController.patchSettings);
/**
 * @swagger
 * /api/user/username:
 *   patch:
 *     summary: PATCH /username
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.patch('/username', requireCustomAuth, userController.patchUsername);

/**
 * @swagger
 * /api/user/cover:
 *   patch:
 *     summary: PATCH /cover
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.patch('/cover', requireCustomAuth, userController.patchCover);
/**
 * @swagger
 * /api/user/account:
 *   delete:
 *     summary: DELETE /account
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.delete('/account', requireCustomAuth, userController.deleteAccount);

/**
 * @swagger
 * /api/user/profile/{username}:
 *   get:
 *     summary: GET /profile/{username}
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/profile/:username', requireCustomAuth, userController.getPublicProfile);

module.exports = router;