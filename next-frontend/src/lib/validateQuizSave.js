import { QUESTION_TYPES, resolveQuestionType } from '@/lib/questionTypes';
import { normalizeTimeLimit } from '@/lib/timeLimit';

function validateQuestion(question, index) {
  const label = `Question ${index + 1}`;
  const questionType = resolveQuestionType(question);
  const answers = question.answers || [];
  if (answers.length < 2) {
    return `${label}: needs at least 2 answers.`;
  }

  if (questionType === QUESTION_TYPES.TRUE_FALSE) {
    if (answers.length !== 2) {
      return `${label}: True or False must have exactly 2 answers.`;
    }
    return null;
  }

  if (questionType === QUESTION_TYPES.DRAG_LAYERS) {
    if (answers.length < 2 || answers.length > 10) {
      return `${label}: Drag & Order needs 2 to 10 steps.`;
    }

    const layerIndexes = answers.map((answer, answerIndex) =>
      Number.isInteger(answer.layerIndex) ? answer.layerIndex : answerIndex
    );
    const uniqueIndexes = new Set(layerIndexes);

    if (
      layerIndexes.some((value) => !Number.isInteger(value))
      || uniqueIndexes.size !== answers.length
      || Math.max(...layerIndexes) !== answers.length - 1
    ) {
      return `${label}: Drag & Order steps need valid order positions.`;
    }
    return null;
  }

  if (questionType === QUESTION_TYPES.LINE_MATCHING) {
    const leftItems = answers.filter((answer) => answer.side === 'left');
    const rightItems = answers.filter((answer) => answer.side === 'right');
    const pairCount = leftItems.length;

    if (pairCount < 2 || pairCount > 8 || rightItems.length !== pairCount) {
      return `${label}: Line Matching needs 2 to 8 pairs.`;
    }

    const invalidLeft = leftItems.some(
      (left) => !left.matchId || !rightItems.some((right) => right.id === left.matchId)
    );
    const pairIndexes = leftItems.map((left, leftIndex) =>
      Number.isInteger(left.pairIndex) ? left.pairIndex : leftIndex
    );
    const uniquePairIndexes = new Set(pairIndexes);

    if (
      invalidLeft
      || pairIndexes.some((value) => !Number.isInteger(value))
      || uniquePairIndexes.size !== pairCount
    ) {
      return `${label}: Line Matching pairs are not linked correctly. Re-open the question and check each pair.`;
    }
    return null;
  }

  if (answers.length < 2 || answers.length > 4) {
    return `${label}: Multiple Choice needs 2 to 4 answers.`;
  }

  return null;
}

export function formatQuestionForSave(question) {
  const questionType = resolveQuestionType(question);

  return {
    id: typeof question.id === 'string' ? question.id : undefined,
    question_text: (question.text || '').trim() || 'Untitled Question',
    image_url: question.image || null,
    question_type: questionType,
    round: question.round || 1,
    time_limit: normalizeTimeLimit(question.time_limit),
    answers: (question.answers || []).map((answer, index) => ({
      id: String(answer.id),
      text: answer.text || '',
      isCorrect: answer.checked !== undefined ? answer.checked : !!answer.isCorrect,
      color: answer.color || 'bg-[#5D3FD3]',
      ...(questionType === QUESTION_TYPES.DRAG_LAYERS
        ? { layerIndex: Number.isInteger(answer.layerIndex) ? answer.layerIndex : index }
        : {}),
      ...(questionType === QUESTION_TYPES.LINE_MATCHING
        ? {
            side: answer.side,
            matchId: answer.matchId,
            pairIndex: Number.isInteger(answer.pairIndex) ? answer.pairIndex : Math.floor(index / 2),
          }
        : {}),
    })),
  };
}

export function validateQuizForSave({ quizTitle, questions = [] }) {
  if (!quizTitle?.trim()) {
    return 'Please enter a quiz title.';
  }

  if (questions.length === 0) {
    return 'A quiz must have at least one question to save.';
  }

  for (let index = 0; index < questions.length; index += 1) {
    const issue = validateQuestion(questions[index], index);
    if (issue) return issue;
  }

  return null;
}