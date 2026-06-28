const { z } = require('zod');
const quizService = require('../services/quizService');
const handleError = require('../lib/errorHandler');
const { stripQuizCorrectAnswers } = require('../lib/quizSanitizer');

// ─── Zod Validation Schemas ──────────────────────────────────────────────────
const answerSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
  color: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string().optional(),
  question_text: z.string().min(1, 'Question text is required'),
  image_url: z.string().nullable().optional(),
  answers: z.array(answerSchema).min(2, 'At least 2 answers required per question'),
  time_limit: z.number().int().positive().optional().default(20),
  round: z.number().int().positive().optional().default(1),
});

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  creator_id: z.string().min(1).optional(),
  cover_image: z.string().nullable().optional(),
  questions: z.array(questionSchema).min(1, 'At least 1 question is required'),
});

const updateQuizSchema = quizSchema.omit({ creator_id: true });

const handleServiceError = (res, err, fallbackMessage) => {
  if (err?.statusCode === 403) {
    return res.status(403).json({ error: err.message });
  }
  if (err?.statusCode === 404) {
    return res.status(404).json({ error: err.message });
  }
  return handleError(res, fallbackMessage, err);
};

/**
 * Handle POST /api/quizzes
 * Create a new quiz (authenticated — creator_id from JWT)
 */
const createQuiz = async (req, res) => {
  try {
    const parsed = quizSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues,
      });
    }

    const { title, questions, cover_image } = parsed.data;
    const creator_id = req.user.userId;

    const quiz = await quizService.createQuiz({ title, creator_id, questions, cover_image });

    console.log(`✅ Quiz saved: ${quiz.title} by ${creator_id}`);
    res.status(201).json({ message: 'Quiz saved successfully', quiz });
  } catch (err) {
    handleServiceError(res, err, 'Failed to save quiz');
  }
};

/**
 * Handle GET /api/quizzes/debug/all
 * Debug endpoint — development only
 */
const getAllQuizzesDebug = async (req, res) => {
  try {
    const data = await quizService.getAllQuizzesDebug();

    res.json({
      total: data.length,
      quizzes: data.map((q) => ({
        ...q,
        creator_id_length: q?.creator_id?.length || 0,
      })),
    });
  } catch (err) {
    handleServiceError(res, err, 'Failed to fetch quizzes');
  }
};

/**
 * Handle GET /api/quizzes/user/:userId
 * Fetch quizzes by the authenticated user
 */
const getQuizzesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { cursor, limit } = req.query;

    const data = await quizService.getQuizzesByUserId(userId, cursor, limit ? parseInt(limit, 10) : 10);
    res.json(data);
  } catch (err) {
    handleServiceError(res, err, 'Failed to fetch quizzes');
  }
};

/**
 * Handle GET /api/quizzes/:id
 * Owner gets full quiz; public quizzes return without correct answers; private quizzes forbidden
 */
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await quizService.getQuizById(id);

    if (!data) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const requesterId = req.user?.userId;
    if (requesterId && data.creator_id === requesterId) {
      return res.json(data);
    }

    if (data.is_public) {
      return res.json(stripQuizCorrectAnswers(data));
    }

    // Same response as not-found to avoid leaking private quiz existence
    return res.status(404).json({ error: 'Quiz not found' });
  } catch (err) {
    handleServiceError(res, err, 'Failed to fetch quiz');
  }
};

/**
 * Handle PUT /api/quizzes/:id
 * Update an existing quiz (owner only)
 */
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const parsed = updateQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues,
      });
    }

    const { title, questions, cover_image } = parsed.data;
    await quizService.updateQuiz(id, { title, questions, cover_image }, req.user.userId);

    res.json({ message: 'Quiz updated successfully' });
  } catch (err) {
    handleServiceError(res, err, 'Failed to update quiz');
  }
};

/**
 * Handle GET /api/quizzes/public
 * Fetch public quizzes (answers stripped)
 */
const getPublicQuizzes = async (req, res) => {
  try {
    const { cursor, limit, search } = req.query;
    const data = await quizService.getPublicQuizzes(cursor, limit ? parseInt(limit, 10) : 10, search);
    res.json(data);
  } catch (err) {
    handleServiceError(res, err, 'Failed to fetch public quizzes');
  }
};

/**
 * Handle POST /api/quizzes/:id/clone
 * Clone a public quiz (authenticated — creator from JWT)
 */
const cloneQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const clonedQuiz = await quizService.cloneQuiz(id, req.user.userId);
    res.status(201).json({ message: 'Quiz cloned successfully', quiz: clonedQuiz });
  } catch (err) {
    handleServiceError(res, err, 'Failed to clone quiz');
  }
};

/**
 * Handle PATCH /api/quizzes/:id/visibility
 * Toggle is_public status (owner only)
 */
const updateVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_public } = req.body;
    if (typeof is_public !== 'boolean') {
      return res.status(400).json({ error: 'is_public boolean is required' });
    }
    await quizService.updateQuizVisibility(id, is_public, req.user.userId);
    res.json({ message: 'Quiz visibility updated successfully' });
  } catch (err) {
    handleServiceError(res, err, 'Failed to update visibility');
  }
};

/**
 * Handle DELETE /api/quizzes/:id
 * Delete a quiz (owner only)
 */
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    await quizService.deleteQuiz(id, req.user.userId);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    handleServiceError(res, err, 'Failed to delete quiz');
  }
};

module.exports = {
  createQuiz,
  getAllQuizzesDebug,
  getQuizzesByUser,
  getQuizById,
  updateQuiz,
  getPublicQuizzes,
  cloneQuiz,
  updateVisibility,
  deleteQuiz,
};