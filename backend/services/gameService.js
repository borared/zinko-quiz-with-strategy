const gameRepository = require('../repositories/gameRepository');

const getQuizForGameHost = async (quizId) => {
  return await gameRepository.getQuizForGameHost(quizId);
};

module.exports = {
  getQuizForGameHost,
};
