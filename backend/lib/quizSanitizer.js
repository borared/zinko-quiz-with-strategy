/**
 * Strips correct-answer metadata from quiz payloads for public/unauthenticated reads.
 */

function stripAnswerCorrectness(answers) {
  if (!Array.isArray(answers)) return answers;
  return answers.map((answer) => {
    const { isCorrect, checked, ...safe } = answer;
    return safe;
  });
}

function stripQuizCorrectAnswers(quiz) {
  if (!quiz) return quiz;
  return {
    ...quiz,
    questions: (quiz.questions || []).map((q) => ({
      ...q,
      answers: stripAnswerCorrectness(q.answers),
    })),
  };
}

function stripQuizzesCorrectAnswers(quizzes) {
  return quizzes.map(stripQuizCorrectAnswers);
}

module.exports = {
  stripAnswerCorrectness,
  stripQuizCorrectAnswers,
  stripQuizzesCorrectAnswers,
};