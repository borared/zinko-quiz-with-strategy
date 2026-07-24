// @zinko/shared — constants/quiz.js (ESM)
export const QUIZ_RULES = {
  MIN_QUESTIONS_PER_ROUND: 6,
  MAX_QUESTIONS_PER_ROUND: 8,
  TOTAL_ROUNDS: 3,
};

export const ROUNDS = [
  { id: 1, label: 'Round 1', difficulty: 'Easy',   color: 'bg-[#00C853]' },
  { id: 2, label: 'Round 2', difficulty: 'Medium',  color: 'bg-[#FFB300]' },
  { id: 3, label: 'Round 3', difficulty: 'Hard',    color: 'bg-[#D32F2F]' },
];

export const ANSWER_SLOTS = [
  { id: 'A', color: 'bg-[#5D3FD3]' },
  { id: 'B', color: 'bg-[#FF6B4A]' },
  { id: 'C', color: 'bg-[#FF4B4B]' },
  { id: 'D', color: 'bg-[#2D3436]' },
];

// CommonJS interop for backend
if (typeof module !== 'undefined') {
  module.exports = { QUIZ_RULES, ROUNDS, ANSWER_SLOTS };
}
