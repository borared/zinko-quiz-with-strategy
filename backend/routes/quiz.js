const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { requireCustomAuth, optionalCustomAuth, requireSelf } = require('../middleware/auth');
const { devOnly, writeLimiter } = require('../middleware/security');

// ─── Public read routes (specific paths before /:id) ─────────────────────────
/**
 * @swagger
 * /api/quizzes/public:
 *   get:
 *     summary: GET /public
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/public', optionalCustomAuth, quizController.getPublicQuizzes);
/**
 * @swagger
 * /api/quizzes/debug/all:
 *   get:
 *     summary: GET /debug/all
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/debug/all', devOnly, quizController.getAllQuizzesDebug);
/**
 * @swagger
 * /api/quizzes/user/{userId}:
 *   get:
 *     summary: GET /user/:userId
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/user/:userId', requireCustomAuth, requireSelf('userId'), quizController.getQuizzesByUser);

// ─── Authenticated write routes ───────────────────────────────────────────────
/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: POST /
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/', requireCustomAuth, writeLimiter, quizController.createQuiz);
/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: PUT /:id
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.put('/:id', requireCustomAuth, writeLimiter, quizController.updateQuiz);
/**
 * @swagger
 * /api/quizzes/{id}/clone:
 *   post:
 *     summary: POST /:id/clone
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/:id/clone', requireCustomAuth, writeLimiter, quizController.cloneQuiz);
/**
 * @swagger
 * /api/quizzes/{id}/visibility:
 *   patch:
 *     summary: PATCH /:id/visibility
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.patch('/:id/visibility', requireCustomAuth, writeLimiter, quizController.updateVisibility);
/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: DELETE /:id
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.delete('/:id', requireCustomAuth, writeLimiter, quizController.deleteQuiz);

// ─── Single quiz read (must be last — catches /:id) ───────────────────────────
/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: GET /:id
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/:id', optionalCustomAuth, quizController.getQuizById);

module.exports = router;