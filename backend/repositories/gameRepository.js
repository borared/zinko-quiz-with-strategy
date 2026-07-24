const prisma = require('../lib/prisma');

/**
 * Fetch a quiz by ID to verify ownership and get title for hosting a game.
 */
const getQuizForGameHost = async (quizId) => {
  const quiz = await prisma.quizzes.findUnique({
    where: { id: quizId },
    select: { id: true, title: true, creator_id: true }
  });

  if (!quiz) throw new Error('Quiz not found');
  
  return quiz;
};

module.exports = {
  getQuizForGameHost,
};
