import {
  LAYER_COLORS,
  MIN_DRAG_LAYERS,
  MAX_DRAG_LAYERS,
  getCorrectLayerOrder,
} from './dragLayersUtils';
import {
  createLineMatchingPairs,
  hasLineMatchingStructure,
  pairsToAnswers,
} from './lineMatchingUtils';

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  DRAG_LAYERS: 'drag_layers',
  LINE_MATCHING: 'line_matching',
};

export const QUESTION_TYPE_OPTIONS = [
  { value: QUESTION_TYPES.MULTIPLE_CHOICE, label: 'Multiple Choice' },
  { value: QUESTION_TYPES.TRUE_FALSE, label: 'True or False' },
  { value: QUESTION_TYPES.DRAG_LAYERS, label: 'Drag & Order' },
  { value: QUESTION_TYPES.LINE_MATCHING, label: 'Line Matching' },
];

const MC_COLORS = ['bg-[#5D3FD3]', 'bg-[#FF6B4A]', 'bg-[#FF4B4B]', 'bg-[#2D3436]'];

export function createMultipleChoiceAnswers(correctId = 'A') {
  return ['A', 'B', 'C', 'D'].map((id, index) => ({
    id,
    text: '',
    color: MC_COLORS[index],
    checked: id === correctId,
  }));
}

export function createTrueFalseAnswers(correctIsTrue = true) {
  return [
    { id: 'A', text: 'True', color: 'bg-[#2ea84a]', checked: correctIsTrue },
    { id: 'B', text: 'False', color: 'bg-[#FF4B4B]', checked: !correctIsTrue },
  ];
}

export function createDragLayersAnswers(count = 3) {
  const layerCount = Math.max(MIN_DRAG_LAYERS, Math.min(count, MAX_DRAG_LAYERS));
  return Array.from({ length: layerCount }, (_, index) => ({
    id: String(index + 1),
    text: '',
    layerIndex: index,
    color: LAYER_COLORS[index % LAYER_COLORS.length],
  }));
}

export function stripHtml(text, { lowerCase = true } = {}) {
  const stripped = String(text || '').replace(/<[^>]*>/g, '').trim();
  return lowerCase ? stripped.toLowerCase() : stripped;
}

export function displayAnswerText(text) {
  return stripHtml(text, { lowerCase: false });
}

export function isTrueFalseQuestion(type) {
  return type === QUESTION_TYPES.TRUE_FALSE;
}

export function isDragLayersQuestion(type) {
  return type === QUESTION_TYPES.DRAG_LAYERS;
}

export function isLineMatchingQuestion(type) {
  return type === QUESTION_TYPES.LINE_MATCHING;
}

export function resolveQuestionType(question = {}) {
  const explicit =
    question.question_type || question.questionType;

  if (explicit === QUESTION_TYPES.LINE_MATCHING) {
    return QUESTION_TYPES.LINE_MATCHING;
  }
  if (explicit === QUESTION_TYPES.DRAG_LAYERS) {
    return QUESTION_TYPES.DRAG_LAYERS;
  }
  if (explicit === QUESTION_TYPES.TRUE_FALSE) {
    return QUESTION_TYPES.TRUE_FALSE;
  }

  const answers = question.answers || [];
  if (hasLineMatchingStructure(answers)) {
    return QUESTION_TYPES.LINE_MATCHING;
  }
  if (answers.some((answer) => {
    const idx = Number(answer.layerIndex);
    return Number.isFinite(idx);
  })) {
    return QUESTION_TYPES.DRAG_LAYERS;
  }

  const inferred = inferQuestionType(answers);
  if (inferred === QUESTION_TYPES.TRUE_FALSE) {
    return QUESTION_TYPES.TRUE_FALSE;
  }

  return explicit || QUESTION_TYPES.MULTIPLE_CHOICE;
}

export function inferQuestionType(answers = []) {
  if (hasLineMatchingStructure(answers)) {
    return QUESTION_TYPES.LINE_MATCHING;
  }
  if (answers.some((answer) => {
    const idx = Number(answer.layerIndex);
    return Number.isFinite(idx);
  })) {
    return QUESTION_TYPES.DRAG_LAYERS;
  }
  if (answers.length === 2) {
    const texts = answers.map((answer) => stripHtml(answer.text));
    if (texts.includes('true') && texts.includes('false')) {
      return QUESTION_TYPES.TRUE_FALSE;
    }
  }
  return QUESTION_TYPES.MULTIPLE_CHOICE;
}

export function getQuestionTypeLabel(type) {
  return QUESTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? 'Multiple Choice';
}

export function convertQuestionType(currentType, nextType, answers = []) {
  if (currentType === nextType) {
    return answers;
  }

  if (nextType === QUESTION_TYPES.TRUE_FALSE) {
    const trueWasCorrect = answers.some(
      (answer) => answer.checked && stripHtml(answer.text) === 'true'
    );
    const firstWasCorrect = answers.find((answer) => answer.checked)?.id === 'A';
    return createTrueFalseAnswers(trueWasCorrect || firstWasCorrect);
  }

  if (nextType === QUESTION_TYPES.DRAG_LAYERS) {
    const seeded = answers
      .filter((answer) => stripHtml(answer.text, { lowerCase: false }))
      .slice(0, MAX_DRAG_LAYERS);

    if (seeded.length >= MIN_DRAG_LAYERS) {
      return seeded.map((answer, index) => ({
        id: String(answer.id ?? index + 1),
        text: displayAnswerText(answer.text),
        layerIndex: index,
        color: LAYER_COLORS[index % LAYER_COLORS.length],
      }));
    }

    return createDragLayersAnswers(3);
  }

  if (nextType === QUESTION_TYPES.LINE_MATCHING) {
    const textItems = answers
      .filter((answer) => stripHtml(answer.text, { lowerCase: false }))
      .slice(0, 8);

    if (textItems.length >= 4) {
      const pairs = [];
      for (let i = 0; i < textItems.length; i += 2) {
        if (!textItems[i + 1]) break;
        pairs.push({
          leftText: displayAnswerText(textItems[i].text),
          rightText: displayAnswerText(textItems[i + 1].text),
        });
      }
      if (pairs.length >= 2) {
        const seeded = pairs.map((pair, index) => {
          const base = createLineMatchingPairs(1)[0];
          return {
            ...base,
            id: `pair-${index + 1}`,
            leftId: `L-pair-${index + 1}`,
            rightId: `R-pair-${index + 1}`,
            pairIndex: index,
            leftText: pair.leftText,
            rightText: pair.rightText,
          };
        });
        return pairsToAnswers(seeded);
      }
    }

    return pairsToAnswers(createLineMatchingPairs(4));
  }

  const correctId = answers.find((answer) => answer.checked)?.id || 'A';
  const mappedCorrect = ['A', 'B', 'C', 'D'].includes(correctId) ? correctId : 'A';
  return createMultipleChoiceAnswers(mappedCorrect);
}

export { getCorrectLayerOrder };