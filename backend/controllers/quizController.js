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

    const quiz = await quizModel.createQuiz({ 
      title, 
      creator_id, 
      questions, 
      cover_image: req.body.cover_image,
      is_public: req.body.is_public || false
    });
    
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
    const { title, questions, cover_image, is_public } = req.body;

    await quizModel.updateQuiz(id, { title, questions, cover_image, is_public });

    res.json({ message: 'Quiz updated successfully' });
  } catch (err) {
    handleError(res, 'Failed to update quiz', err);
  }
};

/**
 * Handle GET /api/quizzes/public
 * Fetch all public quizzes
 */
const getPublicQuizzes = async (req, res) => {
  try {
    const data = await quizModel.getPublicQuizzes();
    res.json(data);
  } catch (err) {
    handleError(res, 'Failed to fetch public quizzes', err);
  }
};

/**
 * Handle PATCH /api/quizzes/:id/visibility
 * Update visibility
 */
const updateVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_public } = req.body;
    if (typeof is_public !== 'boolean') {
      return res.status(400).json({ error: 'is_public must be a boolean' });
    }
    
    // Prevent making a cloned quiz public
    if (is_public) {
      const originalQuiz = await quizModel.getQuizById(id);
      if (originalQuiz && originalQuiz.is_clone) {
        return res.status(403).json({ error: 'Cloned quizzes cannot be made public.' });
      }
    }

    await quizModel.updateQuizVisibility(id, is_public);
    res.json({ message: 'Visibility updated successfully' });
  } catch (err) {
    handleError(res, 'Failed to update visibility', err);
  }
};

/**
 * Handle POST /api/quizzes/:id/clone
 * Clone a quiz to a new creator
 */
const cloneQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { creator_id } = req.body;
    
    if (!creator_id) {
      return res.status(400).json({ error: 'Missing creator_id' });
    }

    // Fetch the original quiz
    const originalQuiz = await quizModel.getQuizById(id);
    if (!originalQuiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Create a new quiz based on the original
    // but assign to the new creator_id and set is_public to false
    const questions = originalQuiz.questions.map(q => ({
      text: q.question_text,
      image: q.image_url,
      answers: q.answers,
      round: q.round
    }));

    const newQuiz = await quizModel.createQuiz({
      title: `${originalQuiz.title} (Clone)`,
      creator_id: creator_id,
      cover_image: originalQuiz.cover_image,
      questions: questions,
      is_public: false,
      is_clone: true
    });

    res.status(201).json({ message: 'Quiz cloned successfully', quiz: newQuiz });
  } catch (err) {
    handleError(res, 'Failed to clone quiz', err);
  }
};

/**
 * Handle DELETE /api/quizzes/:id
 */
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app we might want to check if req.auth.userId == creator_id
    // to prevent unauthorized deletes, but assuming verifyToken is in place
    // and we trust the user for now.
    
    await quizModel.deleteQuiz(id);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    handleError(res, 'Failed to delete quiz', err);
  }
};

module.exports = {
  createQuiz,
  getAllQuizzesDebug,
  getQuizzesByUser,
  getQuizById,
  updateQuiz,
  getPublicQuizzes,
  updateVisibility,
  cloneQuiz,
  deleteQuiz
};
