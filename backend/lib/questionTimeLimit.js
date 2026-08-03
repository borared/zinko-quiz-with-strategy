const QUESTION_TIME_SECONDS = 20;
const ALLOWED_TIME_LIMITS = [20, 30, 60, 100, 120];

function getQuestionTimeLimit(question) {
  const raw = Number(question?.time_limit);
  if (ALLOWED_TIME_LIMITS.includes(raw)) return raw;
  return QUESTION_TIME_SECONDS;
}

module.exports = {
  ALLOWED_TIME_LIMITS,
  QUESTION_TIME_SECONDS,
  getQuestionTimeLimit,
};