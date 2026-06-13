const { z } = require('zod');
const quizService = require('../services/quizService');
const handleError = require('../lib/errorHandler');

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
});

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  creator_id: z.string().min(1, 'Creator ID is required'),
  cover_image: z.string().nullable().optional(),
  questions: z.array(questionSchema).min(1, 'At least 1 question is required'),
});

const updateQuizSchema = quizSchema.omit({ creator_id: true });

/**
 * Handle POST /api/quizzes
 * Create a new quiz
 */
const createQuiz = async (req, res) => {
  try {
    // Validate request body
    const parsed = quizSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parsed.error.issues 
      });
    }

    const { title, creator_id, questions, cover_image } = parsed.data;

    const quiz = await quizService.createQuiz({ title, creator_id, questions, cover_image });
    
    console.log(`✅ Quiz saved: ${quiz.title} by ${creator_id}`);
    res.status(201).json({ message: 'Quiz saved successfully', quiz });
  } catch (err) {
    handleError(res, 'Failed to save quiz', err);
  }
};

/**
 * Handle GET /api/quizzes/debug/all
 * Debug endpoint to fetch all quizzes
 */
const getAllQuizzesDebug = async (req, res) => {
  try {
    const data = await quizService.getAllQuizzesDebug();
    
    res.json({ 
      total: data.length,
      quizzes: data.map(q => ({
        ...q,
        creator_id_length: q?.creator_id?.length || 0
      }))
    });
  } catch (err) {
    handleError(res, 'Failed to fetch quizzes', err);
  }
};

/**
 * Handle GET /api/quizzes/user/:userId
 * Fetch quizzes by a specific user
 */
const getQuizzesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Fetching quizzes for user: "${userId}" (length: ${userId.length})`);
    
    const data = await quizService.getQuizzesByUserId(userId);
    
    console.log(`✅ Found ${data.length} quizzes for user: ${userId}`);
    res.json(data);
  } catch (err) {
    handleError(res, 'Failed to fetch quizzes', err);
  }
};

/**
 * Handle GET /api/quizzes/:id
 * Fetch a specific quiz
 */
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await quizService.getQuizById(id);
    res.json(data);
  } catch (err) {
    handleError(res, 'Failed to fetch quiz', err);
  }
};

/**
 * Handle PUT /api/quizzes/:id
 * Update an existing quiz
 */
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const parsed = updateQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parsed.error.issues 
      });
    }

    const { title, questions, cover_image } = parsed.data;

    await quizService.updateQuiz(id, { title, questions, cover_image });

    res.json({ message: 'Quiz updated successfully' });
  } catch (err) {
    handleError(res, 'Failed to update quiz', err);
  }
};

module.exports = {
  createQuiz,
  getAllQuizzesDebug,
  getQuizzesByUser,
  getQuizById,
  updateQuiz,
};
