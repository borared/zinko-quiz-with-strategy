const quizRepository = require('../repositories/quizRepository');
const userRepository = require('../repositories/userRepository');
const notificationService = require('./notificationService');
const { stripQuizzesCorrectAnswers } = require('../lib/quizSanitizer');

class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

const assertQuizOwner = async (quizId, userId) => {
  const quiz = await quizRepository.getQuizById(quizId);
  if (!quiz) throw new NotFoundError('Quiz not found');
  if (quiz.creator_id !== userId) throw new ForbiddenError('You do not own this quiz');
  return quiz;
};

/**
 * Service: Handles business logic for quizzes
 */
const createQuiz = async (quizData) => {
  return await quizRepository.createQuiz(quizData);
};

const updateQuiz = async (id, quizData, userId) => {
  await assertQuizOwner(id, userId);
  return await quizRepository.updateQuiz(id, quizData);
};

const getQuizById = async (id) => {
  return await quizRepository.getQuizById(id);
};

const getQuizzesByUserId = async (userId, cursor, limit) => {
  return await quizRepository.getQuizzesByUserId(userId, cursor, limit);
};

const getAllQuizzesDebug = async () => {
  return await quizRepository.getAllQuizzesDebug();
};

const cloneQuiz = async (quizId, newCreatorId) => {
  const originalQuiz = await quizRepository.getQuizById(quizId);
  if (!originalQuiz) throw new NotFoundError('Quiz not found');
  if (!originalQuiz.is_public) {
    throw new ForbiddenError('Only public quizzes can be cloned');
  }

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

const getPublicQuizzes = async (cursor, limit, searchQuery) => {
  const result = await quizRepository.getPublicQuizzes(cursor, limit, searchQuery);
  return {
    ...result,
    quizzes: stripQuizzesCorrectAnswers(result.quizzes || []),
  };
};

const updateQuizVisibility = async (id, is_public, userId) => {
  await assertQuizOwner(id, userId);
  return await quizRepository.updateQuizVisibility(id, is_public);
};

const deleteQuiz = async (id, userId) => {
  await assertQuizOwner(id, userId);
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
  assertQuizOwner,
  ForbiddenError,
  NotFoundError,
};
