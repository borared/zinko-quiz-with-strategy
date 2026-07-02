const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  DRAG_LAYERS: 'drag_layers',
  LINE_MATCHING: 'line_matching',
};

function hasLineMatchingStructure(answers = []) {
  return answers.some((answer) => answer.side === 'left' || answer.side === 'right');
}

function stripHtml(text) {
  return String(text || '').replace(/<[^>]*>/g, '').trim().toLowerCase();
}

function inferQuestionType(answers = []) {
  if (hasLineMatchingStructure(answers)) {
    return QUESTION_TYPES.LINE_MATCHING;
  }
  const { hasLayerOrdering } = require('./dragLayersUtils');
  if (hasLayerOrdering(answers)) {
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

function resolveQuestionType(question = {}) {
  if (question.question_type === QUESTION_TYPES.LINE_MATCHING) {
    return QUESTION_TYPES.LINE_MATCHING;
  }
  if (question.question_type === QUESTION_TYPES.DRAG_LAYERS) {
    return QUESTION_TYPES.DRAG_LAYERS;
  }
  if (question.question_type === QUESTION_TYPES.TRUE_FALSE) {
    return QUESTION_TYPES.TRUE_FALSE;
  }

  const inferred = inferQuestionType(question.answers || []);
  if (inferred === QUESTION_TYPES.LINE_MATCHING) {
    return QUESTION_TYPES.LINE_MATCHING;
  }
  if (inferred === QUESTION_TYPES.TRUE_FALSE) {
    return QUESTION_TYPES.TRUE_FALSE;
  }
  if (inferred === QUESTION_TYPES.DRAG_LAYERS) {
    return QUESTION_TYPES.DRAG_LAYERS;
  }

  return question.question_type || QUESTION_TYPES.MULTIPLE_CHOICE;
}

module.exports = {
  QUESTION_TYPES,
  stripHtml,
  inferQuestionType,
  resolveQuestionType,
};