const quizModel = require('../models/quizModel');
const handleError = require('../lib/errorHandler');

/**
 * Handle POST /api/quizzes
 * Create a new quiz
 */
const createQuiz = async (req, res) => {
  try {
    const { title, creator_id, questions } = req.body;

    if (!title || !creator_id || !questions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const quiz = await quizModel.createQuiz({ title, creator_id, questions, cover_image: req.body.cover_image });
    
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
    const data = await quizModel.getAllQuizzesDebug();
    
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
    
    const data = await quizModel.getQuizzesByUserId(userId);
    
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
    const data = await quizModel.getQuizById(id);
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
    const { title, questions, cover_image } = req.body;

    await quizModel.updateQuiz(id, { title, questions, cover_image });

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
