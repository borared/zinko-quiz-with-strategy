function sortLeftItems(answers = []) {
  return answers
    .filter((answer) => answer.side === 'left')
    .sort((a, b) => (a.pairIndex ?? 0) - (b.pairIndex ?? 0));
}

function sortRightItems(answers = []) {
  return answers
    .filter((answer) => answer.side === 'right')
    .sort((a, b) => (a.pairIndex ?? 0) - (b.pairIndex ?? 0));
}

function getCorrectMatches(answers = []) {
  const leftItems = sortLeftItems(answers);
  return Object.fromEntries(leftItems.map((left) => [left.id, left.matchId]));
}

function parseLineMatchingAnswer(raw) {
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isLineMatchingCorrect(submitted = {}, correct = {}) {
  const leftIds = Object.keys(correct);
  if (leftIds.length === 0) return false;
  return leftIds.every((leftId) => submitted[leftId] === correct[leftId]);
}

function shuffleRightItems(items = []) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function mapPublicLineItem(answer) {
  return {
    id: answer.id,
    text: answer.text,
    color: answer.color,
  };
}

function buildLineMatchingPayload(answers = []) {
  const leftItems = sortLeftItems(answers).map(mapPublicLineItem);
  const rightItems = shuffleRightItems(sortRightItems(answers)).map(mapPublicLineItem);

  return {
    leftItems,
    rightItems,
    pairCount: leftItems.length,
  };
}

function buildLineMatchingStats(game, question) {
  const answers = question.answers || [];
  const leftItems = sortLeftItems(answers);
  const rightById = Object.fromEntries(
    answers.filter((answer) => answer.side === 'right').map((answer) => [answer.id, answer])
  );
  const correctMatches = getCorrectMatches(answers);

  return leftItems.map((left, index) => {
    const correctRightId = correctMatches[left.id];
    const correctRight = rightById[correctRightId];
    let count = 0;

    Object.values(game.answers).forEach((rawAnswer) => {
      const submitted = parseLineMatchingAnswer(rawAnswer);
      if (submitted && submitted[left.id] === correctRightId) {
        count += 1;
      }
    });

    return {
      id: left.id,
      text: left.text,
      color: left.color,
      count,
      isCorrect: true,
      pairLabel: `Pair ${index + 1}`,
      matchText: correctRight?.text || '',
    };
  });
}

module.exports = {
  sortLeftItems,
  sortRightItems,
  getCorrectMatches,
  parseLineMatchingAnswer,
  isLineMatchingCorrect,
  shuffleRightItems,
  buildLineMatchingPayload,
  buildLineMatchingStats,
  mapPublicLineItem,
};