const { QUESTION_TIME_SECONDS } = require('./socketUtils');

const ALLOWED_TIME_LIMITS = [20, 30, 60];

function getQuestionTimeLimit(question) {
  const raw = Number(question?.time_limit);
  if (ALLOWED_TIME_LIMITS.includes(raw)) return raw;
  if (Number.isInteger(raw) && raw > 0 && raw <= 120) return raw;
  return QUESTION_TIME_SECONDS;
}

module.exports = {
  ALLOWED_TIME_LIMITS,
  getQuestionTimeLimit,
};