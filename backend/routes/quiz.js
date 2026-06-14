const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

/**
 * POST /api/quizzes
 * Save a new quiz
 */
router.post('/', quizController.createQuiz);

/**
 * GET /api/quizzes/debug/all
 * Debug endpoint - fetch all quizzes with creator info
 */
router.get('/debug/all', quizController.getAllQuizzesDebug);

/**
 * GET /api/quizzes/public
 * Fetch all public quizzes
 */
router.get('/public', quizController.getPublicQuizzes);

/**
 * GET /api/quizzes/user/:userId
 * Fetch all quizzes for a specific creator
 */
router.get('/user/:userId', quizController.getQuizzesByUser);

/**
 * GET /api/quizzes/:id
 * Fetch a single quiz with its questions
 */
router.get('/:id', quizController.getQuizById);

/**
 * PUT /api/quizzes/:id
 * Update an existing quiz
 */
router.put('/:id', quizController.updateQuiz);

/**
 * POST /api/quizzes/:id/clone
 * Clone a public quiz
 */
router.post('/:id/clone', quizController.cloneQuiz);

/**
 * PATCH /api/quizzes/:id/visibility
 * Toggle is_public status
 */
router.patch('/:id/visibility', quizController.updateVisibility);

/**
 * DELETE /api/quizzes/:id
 * Delete a quiz
 */
router.delete('/:id', quizController.deleteQuiz);

module.exports = router;
