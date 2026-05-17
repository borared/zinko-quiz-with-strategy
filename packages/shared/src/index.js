// @zinko/shared — src/index.js
// Single entry point — ESM exports so Vite (frontend) can import it directly.
// Backend (CommonJS) uses: const { QUIZ_RULES } = require('@zinko/shared');
// Frontend (ESM/Vite): import { QUIZ_RULES } from '@zinko/shared';

export { QUIZ_RULES, ROUNDS, ANSWER_SLOTS } from './constants/quiz.js';
export { COLORS, SHADOWS } from './constants/colors.js';
export { validateRound, validateQuiz } from './utils/validation.js';
