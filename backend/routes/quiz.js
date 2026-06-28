const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { requireCustomAuth, optionalCustomAuth, requireSelf } = require('../middleware/auth');
const { devOnly, writeLimiter } = require('../middleware/security');

// ─── Public read routes (specific paths before /:id) ─────────────────────────
router.get('/public', quizController.getPublicQuizzes);
router.get('/debug/all', devOnly, quizController.getAllQuizzesDebug);
router.get('/user/:userId', requireCustomAuth, requireSelf('userId'), quizController.getQuizzesByUser);

// ─── Authenticated write routes ───────────────────────────────────────────────
router.post('/', requireCustomAuth, writeLimiter, quizController.createQuiz);
router.put('/:id', requireCustomAuth, writeLimiter, quizController.updateQuiz);
router.post('/:id/clone', requireCustomAuth, writeLimiter, quizController.cloneQuiz);
router.patch('/:id/visibility', requireCustomAuth, writeLimiter, quizController.updateVisibility);
router.delete('/:id', requireCustomAuth, writeLimiter, quizController.deleteQuiz);

// ─── Single quiz read (must be last — catches /:id) ───────────────────────────
router.get('/:id', optionalCustomAuth, quizController.getQuizById);

module.exports = router;