const { getQuestionTimeLimit } = require('./questionTimeLimit');
const { resolveQuestionType, QUESTION_TYPES } = require('./questionTypes');
const { shuffleAnswers } = require('./dragLayersUtils');
const { buildLineMatchingPayload } = require('./lineMatchingUtils');

function mapPublicAnswers(answers = []) {
  return Array.isArray(answers)
    ? answers.map((answer) => ({
        id: answer.id,
        text: answer.text,
        color: answer.color,
      }))
    : [];
}

function buildGameQuestionPayload(question, game, questionIndex, extra = {}) {
  const questionType = resolveQuestionType(question);
  const fullAnswers = question.answers || [];
  const isDragLayers = questionType === QUESTION_TYPES.DRAG_LAYERS;
  const isLineMatching = questionType === QUESTION_TYPES.LINE_MATCHING;
  const sourceAnswers = isDragLayers ? shuffleAnswers(fullAnswers) : fullAnswers;
  const lineMatchingPayload = isLineMatching ? buildLineMatchingPayload(fullAnswers) : {};

  return {
    gameType: game.gameType || 'QUIZ',
    index: questionIndex,
    round: Math.floor(questionIndex / 5) + 1,
    match: (questionIndex % 5) + 1,
    total: game.questions.length,
    questionText: question.question_text || '',
    imageUrl: question.image_url || null,
    questionType,
    layerCount: isDragLayers ? fullAnswers.length : undefined,
    pairCount: isLineMatching ? lineMatchingPayload.pairCount : undefined,
    leftItems: isLineMatching ? lineMatchingPayload.leftItems : undefined,
    rightItems: isLineMatching ? lineMatchingPayload.rightItems : undefined,
    answers: isLineMatching ? [] : mapPublicAnswers(sourceAnswers),
    timeSeconds: getQuestionTimeLimit(question),
    skillCharges: game.skillCharges,
    background: game.background,
    ...extra,
  };
}

module.exports = {
  mapPublicAnswers,
  buildGameQuestionPayload,
};