const quizRepository = require('../repositories/quizRepository');
const userRepository = require('../repositories/userRepository');
const notificationService = require('./notificationService');

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

const cloneQuiz = async (quizId, newCreatorId) => {
  const originalQuiz = await quizRepository.getQuizById(quizId);
  if (!originalQuiz) throw new Error("Quiz not found");

  const clonedData = {
    title: `${originalQuiz.title} (Clone)`,
    creator_id: newCreatorId,
    cover_image: originalQuiz.cover_image,
    is_public: false,
    is_cloned: true,
    questions: originalQuiz.questions.map(q => ({
      text: q.question_text,
      image: q.image_url,
      answers: q.answers,
      round: q.round
    }))
  };

  const clonedQuiz = await quizRepository.createQuiz(clonedData);

  try {
    // Notify the original creator
    const clonerUser = await userRepository.getUserByClerkId(newCreatorId);
    const clonerName = clonerUser ? (clonerUser.first_name || clonerUser.username || 'Someone') : 'Someone';
    const message = `cloned your quiz "${originalQuiz.title}"`;
    const metadata = {
      cloner_id: newCreatorId,
      cloner_name: clonerName,
      cloner_avatar: clonerUser?.avatar_url || null
    };
    await notificationService.createNotification(originalQuiz.creator_id, 'QUIZ_CLONED', message, metadata);
  } catch (error) {
    console.error("Failed to create notification for cloned quiz:", error);
  }

  return clonedQuiz;
};

const getPublicQuizzes = async () => {
  return await quizRepository.getPublicQuizzes();
};

const updateQuizVisibility = async (id, is_public) => {
  return await quizRepository.updateQuizVisibility(id, is_public);
};

const deleteQuiz = async (id) => {
  return await quizRepository.deleteQuiz(id);
};

module.exports = {
  createQuiz,
  updateQuiz,
  getQuizById,
  getQuizzesByUserId,
  getAllQuizzesDebug,
  cloneQuiz,
  getPublicQuizzes,
  updateQuizVisibility,
  deleteQuiz,
};
