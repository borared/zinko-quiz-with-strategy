import {
  QUESTION_TYPES,
  createTrueFalseAnswers,
} from '@/lib/questionTypes';
import { LAYER_COLORS, MAX_DRAG_LAYERS, MIN_DRAG_LAYERS } from '@/lib/dragLayersUtils';
import {
  createLineMatchingPair,
  MAX_LINE_MATCH_PAIRS,
  MIN_LINE_MATCH_PAIRS,
  pairsToAnswers,
} from '@/lib/lineMatchingUtils';
import { DEFAULT_TIME_LIMIT, normalizeTimeLimit } from '@/lib/timeLimit';

const MC_COLORS = ['bg-[#5D3FD3]', 'bg-[#FF6B4A]', 'bg-[#FF4B4B]', 'bg-[#2D3436]'];

function withTimeLimit(question, q) {
  const raw = q.time_limit ?? q.timeLimit ?? q.timeSeconds;
  return {
    ...question,
    time_limit: normalizeTimeLimit(raw ?? DEFAULT_TIME_LIMIT),
  };
}

function normalizeQuestionType(raw) {
  const value = String(raw || '').toLowerCase().trim();
  if (value === 'true_false' || value === 'true or false' || value === 'true/false') {
    return QUESTION_TYPES.TRUE_FALSE;
  }
  if (
    value === 'drag_layers'
    || value === 'drag and order'
    || value === 'drag & order'
    || value === 'ordering'
    || value === 'sequence'
  ) {
    return QUESTION_TYPES.DRAG_LAYERS;
  }
  if (
    value === 'line_matching'
    || value === 'line matching'
    || value === 'match pairs'
    || value === 'matching'
    || value === 'matching pairs'
  ) {
    return QUESTION_TYPES.LINE_MATCHING;
  }
  return QUESTION_TYPES.MULTIPLE_CHOICE;
}

function parseAiPairs(q) {
  const raw = q.pairs || q.matchingPairs || q.matches || q.leftRightPairs || [];
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (Array.isArray(item)) {
        return { left: item[0], right: item[1] };
      }
      if (typeof item === 'object' && item !== null) {
        return {
          left: item.left ?? item.leftTerm ?? item.leftItem ?? item.prompt ?? item.term ?? '',
          right: item.right ?? item.rightTerm ?? item.rightItem ?? item.match ?? item.answer ?? item.definition ?? '',
        };
      }
      return { left: '', right: '' };
    })
    .map((pair) => ({
      left: String(pair.left || '').trim(),
      right: String(pair.right || '').trim(),
    }))
    .filter((pair) => pair.left || pair.right);
}

function formatMultipleChoice(q, id, activeRound) {
  const correctIndex = q.correctAnswerIndex !== undefined
    ? parseInt(q.correctAnswerIndex, 10)
    : 0;
  const aiChoices = Array.isArray(q.choices) ? q.choices : [];

  const filledAnswers = Array.from({ length: 4 }).map((_, i) => ({
    id: String.fromCharCode(65 + i),
    text: aiChoices[i] || '',
    color: MC_COLORS[i],
    checked: i === correctIndex,
  }));

  return withTimeLimit({
    id,
    text: q.question || q.question_text || '',
    questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
    answers: filledAnswers,
    image: null,
    round: activeRound,
  }, q);
}

function formatTrueFalse(q, id, activeRound) {
  const answer = String(q.correctAnswer ?? q.correct ?? 'true').toLowerCase();
  const correctIsTrue = answer !== 'false';

  return withTimeLimit({
    id,
    text: q.question || q.question_text || '',
    questionType: QUESTION_TYPES.TRUE_FALSE,
    answers: createTrueFalseAnswers(correctIsTrue),
    image: null,
    round: activeRound,
  }, q);
}

function formatLineMatching(q, id, activeRound) {
  const parsedPairs = parseAiPairs(q);
  const pairCount = Math.max(
    MIN_LINE_MATCH_PAIRS,
    Math.min(parsedPairs.length || 4, MAX_LINE_MATCH_PAIRS)
  );

  const pairs = Array.from({ length: pairCount }, (_, index) => {
    const base = createLineMatchingPair(index);
    const source = parsedPairs[index];
    return {
      ...base,
      leftText: source?.left || '',
      rightText: source?.right || '',
    };
  });

  return withTimeLimit({
    id,
    text: q.question || q.question_text || '',
    questionType: QUESTION_TYPES.LINE_MATCHING,
    answers: pairsToAnswers(pairs),
    image: null,
    round: activeRound,
  }, q);
}

function formatDragLayers(q, id, activeRound) {
  const rawSteps = q.steps || q.layers || q.orderedSteps || [];
  const steps = Array.isArray(rawSteps)
    ? rawSteps.map((step) => String(step).trim()).filter(Boolean)
    : [];

  const finalSteps = steps.length >= MIN_DRAG_LAYERS
    ? steps.slice(0, MAX_DRAG_LAYERS)
    : ['First step', 'Second step', 'Third step'];

  const answers = finalSteps.map((text, index) => ({
    id: String(index + 1),
    text,
    layerIndex: index,
    color: LAYER_COLORS[index % LAYER_COLORS.length],
  }));

  return withTimeLimit({
    id,
    text: q.question || q.question_text || '',
    questionType: QUESTION_TYPES.DRAG_LAYERS,
    answers,
    image: null,
    round: activeRound,
  }, q);
}

export function formatAiQuestions(aiQuestions = [], activeRound) {
  const baseId = Date.now();

  return aiQuestions.map((q, index) => {
    const id = baseId + index;
    const hasPairs = Array.isArray(q.pairs || q.matchingPairs || q.matches);
    const questionType = q.questionType || q.question_type
      ? normalizeQuestionType(q.questionType || q.question_type)
      : hasPairs
        ? QUESTION_TYPES.LINE_MATCHING
        : QUESTION_TYPES.MULTIPLE_CHOICE;

    if (questionType === QUESTION_TYPES.TRUE_FALSE) {
      return formatTrueFalse(q, id, activeRound);
    }
    if (questionType === QUESTION_TYPES.DRAG_LAYERS) {
      return formatDragLayers(q, id, activeRound);
    }
    if (questionType === QUESTION_TYPES.LINE_MATCHING) {
      return formatLineMatching(q, id, activeRound);
    }
    return formatMultipleChoice(q, id, activeRound);
  });
}