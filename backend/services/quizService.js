const quizRepository = require('../repositories/quizRepository');

/**
 * Service: Handles business logic for quizzes
 */
const createQuiz = async (quizData) => {
  // In the future, business logic like calculating total time limit
  // or auto-generating metadata could go here before hitting the DB.
  return await quizRepository.createQuiz(quizData);
};

const updateQuiz = async (id, quizData) => {
  return await quizRepository.updateQuiz(id, quizData);
};

const getQuizById = async (id) => {
  return await quizRepository.getQuizById(id);
};

const getQuizzesByUserId = async (userId) => {
  return await quizRepository.getQuizzesByUserId(userId);
};

const getAllQuizzesDebug = async () => {
  return await quizRepository.getAllQuizzesDebug();
};

module.exports = {
  createQuiz,
  updateQuiz,
  getQuizById,
  getQuizzesByUserId,
  getAllQuizzesDebug,
};
