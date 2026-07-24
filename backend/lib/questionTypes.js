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

const VALID_QUESTION_TYPES = new Set(Object.values(QUESTION_TYPES));

function resolveQuestionType(question = {}) {
  const explicit = question.question_type || question.questionType;

  if (explicit && VALID_QUESTION_TYPES.has(explicit)) {
    return explicit;
  }

  return inferQuestionType(question.answers || []);
}

module.exports = {
  QUESTION_TYPES,
  stripHtml,
  inferQuestionType,
  resolveQuestionType,
};