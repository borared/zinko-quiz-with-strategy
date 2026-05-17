// @zinko/shared — utils/validation.js (ESM)
import { QUIZ_RULES } from '../constants/quiz.js';

export function validateRound(questions, roundId) {
  const roundQuestions = questions.filter(q => q.round === roundId);
  const count = roundQuestions.length;
  const valid = count >= QUIZ_RULES.MIN_QUESTIONS_PER_ROUND;

  return {
    valid,
    count,
    message: valid
      ? `Round ${roundId} is ready (${count} questions)`
      : `Round ${roundId} needs at least ${QUIZ_RULES.MIN_QUESTIONS_PER_ROUND} questions (has ${count})`,
  };
}

export function validateQuiz(questions) {
  const errors = [];
  for (let r = 1; r <= QUIZ_RULES.TOTAL_ROUNDS; r++) {
    const result = validateRound(questions, r);
    if (!result.valid) errors.push(result.message);
  }
  return { valid: errors.length === 0, errors };
}
