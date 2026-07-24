function normalizeLayerIndex(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function hasLayerOrdering(answers = []) {
  return answers.some((answer) => normalizeLayerIndex(answer.layerIndex) !== null);
}

function sortAnswersByLayer(answers = []) {
  return [...answers].sort(
    (a, b) => (normalizeLayerIndex(a.layerIndex) ?? 0) - (normalizeLayerIndex(b.layerIndex) ?? 0)
  );
}

function getCorrectLayerOrder(answers = []) {
  return sortAnswersByLayer(answers).map((answer) => answer.id);
}

function parseDragLayerAnswer(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isLayerOrderCorrect(submittedOrder = [], correctOrder = []) {
  if (submittedOrder.length !== correctOrder.length) return false;
  return submittedOrder.every((id, index) => id === correctOrder[index]);
}

function shuffleAnswers(answers = []) {
  const copy = [...answers];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

module.exports = {
  normalizeLayerIndex,
  hasLayerOrdering,
  sortAnswersByLayer,
  getCorrectLayerOrder,
  parseDragLayerAnswer,
  isLayerOrderCorrect,
  shuffleAnswers,
};