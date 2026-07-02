export const MIN_LINE_MATCH_PAIRS = 2;
export const MAX_LINE_MATCH_PAIRS = 8;

const LEFT_COLORS = [
  'bg-[#5D3FD3]',
  'bg-[#3B68FF]',
  'bg-[#2ea84a]',
  'bg-[#FF6B4A]',
  'bg-[#9B59B6]',
  'bg-[#2D3436]',
  'bg-[#1ABC9C]',
  'bg-[#E74C3C]',
];

const RIGHT_COLORS = [
  'bg-[#FFCD29]',
  'bg-[#FF6B4A]',
  'bg-[#5D3FD3]',
  'bg-[#2ea84a]',
  'bg-[#3B68FF]',
  'bg-[#F39C12]',
  'bg-[#E74C3C]',
  'bg-[#2D3436]',
];

export function createPairId(index) {
  return `pair-${index + 1}`;
}

export function createLineMatchingPair(index = 0) {
  const pairId = createPairId(index);
  return {
    id: pairId,
    leftId: `L-${pairId}`,
    rightId: `R-${pairId}`,
    leftText: '',
    rightText: '',
    leftColor: LEFT_COLORS[index % LEFT_COLORS.length],
    rightColor: RIGHT_COLORS[index % RIGHT_COLORS.length],
    pairIndex: index,
  };
}

export function createLineMatchingPairs(count = 4) {
  const pairCount = Math.max(MIN_LINE_MATCH_PAIRS, Math.min(count, MAX_LINE_MATCH_PAIRS));
  return Array.from({ length: pairCount }, (_, index) => createLineMatchingPair(index));
}

export function pairsToAnswers(pairs = []) {
  return pairs.flatMap((pair, index) => [
    {
      id: pair.leftId,
      text: pair.leftText || '',
      side: 'left',
      matchId: pair.rightId,
      pairIndex: index,
      color: pair.leftColor,
      isCorrect: true,
    },
    {
      id: pair.rightId,
      text: pair.rightText || '',
      side: 'right',
      pairIndex: index,
      color: pair.rightColor,
      isCorrect: true,
    },
  ]);
}

export function answersToPairs(answers = []) {
  const leftItems = answers
    .filter((answer) => answer.side === 'left')
    .sort((a, b) => (a.pairIndex ?? 0) - (b.pairIndex ?? 0));

  if (leftItems.length === 0) return [];

  return leftItems.map((left, index) => {
    const right = answers.find(
      (answer) => answer.side === 'right' && (answer.id === left.matchId || answer.pairIndex === left.pairIndex)
    );
    const pairId = createPairId(index);
    return {
      id: pairId,
      leftId: left.id,
      rightId: right?.id || `R-${pairId}`,
      leftText: left.text || '',
      rightText: right?.text || '',
      leftColor: left.color || LEFT_COLORS[index % LEFT_COLORS.length],
      rightColor: right?.color || RIGHT_COLORS[index % RIGHT_COLORS.length],
      pairIndex: index,
    };
  });
}

export function hasLineMatchingStructure(answers = []) {
  return answers.some((answer) => answer.side === 'left' || answer.side === 'right');
}

export function addLineMatchingPair(pairs = []) {
  if (pairs.length >= MAX_LINE_MATCH_PAIRS) return pairs;
  return [...pairs, createLineMatchingPair(pairs.length)];
}

export function removeLineMatchingPair(pairs = [], index) {
  if (pairs.length <= MIN_LINE_MATCH_PAIRS) return pairs;
  return pairs
    .filter((_, pairIndex) => pairIndex !== index)
    .map((pair, pairIndex) => ({
      ...createLineMatchingPair(pairIndex),
      leftText: pair.leftText,
      rightText: pair.rightText,
    }));
}

export function updatePairField(pairs, index, field, value) {
  return pairs.map((pair, pairIndex) =>
    pairIndex === index ? { ...pair, [field]: value } : pair
  );
}

export function assignLineMatch(connections = {}, leftId, rightId) {
  const next = { ...connections };
  Object.keys(next).forEach((key) => {
    if (next[key] === rightId) delete next[key];
  });
  next[leftId] = rightId;
  return next;
}

export function buildConnectionsPayload(connections = {}) {
  return JSON.stringify(connections);
}

export function parseLineMatchingAnswer(raw) {
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