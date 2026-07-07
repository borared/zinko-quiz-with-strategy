export const LAYER_COLORS = [
  'bg-[#5D3FD3]',
  'bg-[#FF6B4A]',
  'bg-[#FFCD29]',
  'bg-[#2ea84a]',
  'bg-[#3B68FF]',
  'bg-[#2D3436]',
];

export const PLAY_LAYER_COLORS = [
  'bg-[#3A2898]',
  'bg-[#A83C24]',
  'bg-[#755A0C]',
  'bg-[#17632E]',
  'bg-[#254AA8]',
  'bg-[#262626]',
  'bg-[#961E1E]',
  'bg-[#4E2088]',
  'bg-[#0C6058]',
  'bg-[#A03810]',
];

const CREATOR_TO_PLAY_COLOR = {
  'bg-[#5D3FD3]': 'bg-[#3A2898]',
  'bg-[#FF6B4A]': 'bg-[#A83C24]',
  'bg-[#FFCD29]': 'bg-[#755A0C]',
  'bg-[#2ea84a]': 'bg-[#17632E]',
  'bg-[#3B68FF]': 'bg-[#254AA8]',
  'bg-[#2D3436]': 'bg-[#262626]',
  'bg-[#E74C3C]': 'bg-[#961E1E]',
  'bg-[#9B59B6]': 'bg-[#4E2088]',
  'bg-[#1ABC9C]': 'bg-[#0C6058]',
  'bg-[#F39C12]': 'bg-[#A03810]',
};

export function getPlayLayerColor(color, index = 0) {
  if (color && CREATOR_TO_PLAY_COLOR[color]) {
    return CREATOR_TO_PLAY_COLOR[color];
  }
  return PLAY_LAYER_COLORS[Math.abs(index) % PLAY_LAYER_COLORS.length];
}

export const MIN_DRAG_LAYERS = 2;
export const MAX_DRAG_LAYERS = 20;

export function normalizeLayerIndex(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function hasLayerOrdering(answers = []) {
  return answers.some((answer) => normalizeLayerIndex(answer.layerIndex) !== null);
}

export function sortAnswersByLayer(answers = []) {
  return [...answers].sort(
    (a, b) => (normalizeLayerIndex(a.layerIndex) ?? 0) - (normalizeLayerIndex(b.layerIndex) ?? 0)
  );
}

export function syncPoolFromSlots(answers, slots) {
  const used = new Set(Object.values(slots).filter(Boolean));
  return answers.map((answer) => answer.id).filter((id) => !used.has(id));
}

export function applyLayerPlacement(slots, answers, itemId, targetLayer) {
  const next = { ...slots };
  const sourceLayer = Object.entries(next).find(([, id]) => id === itemId)?.[0];
  const displaced = next[targetLayer];

  next[targetLayer] = itemId;
  if (sourceLayer !== undefined) {
    next[sourceLayer] = displaced || null;
  }

  return {
    slots: next,
    pool: syncPoolFromSlots(answers, next),
  };
}

export function returnChipToPool(slots, answers, itemId) {
  const next = { ...slots };
  const sourceLayer = Object.entries(next).find(([, id]) => id === itemId)?.[0];
  if (sourceLayer !== undefined) {
    next[sourceLayer] = null;
  }

  return {
    slots: next,
    pool: syncPoolFromSlots(answers, next),
  };
}

export function getCorrectLayerOrder(answers = []) {
  return sortAnswersByLayer(answers).map((answer) => answer.id);
}

export function moveItemToLayer(answers, itemId, targetLayer) {
  const moving = answers.find((answer) => answer.id === itemId);
  if (!moving) return answers;

  const occupying = answers.find((answer) => answer.layerIndex === targetLayer);
  const sourceLayer = moving.layerIndex;

  return answers.map((answer) => {
    if (answer.id === itemId) {
      return { ...answer, layerIndex: targetLayer };
    }
    if (occupying && answer.id === occupying.id) {
      return { ...answer, layerIndex: sourceLayer };
    }
    return answer;
  });
}

export function addDragLayer(answers = []) {
  if (answers.length >= MAX_DRAG_LAYERS) return answers;

  const nextIndex = answers.length;
  return [
    ...answers,
    {
      id: String(Date.now()),
      text: '',
      layerIndex: nextIndex,
      color: LAYER_COLORS[nextIndex % LAYER_COLORS.length],
    },
  ];
}

export function removeDragLayer(answers = [], layerIndex) {
  if (answers.length <= MIN_DRAG_LAYERS) return answers;

  const filtered = answers.filter((answer) => answer.layerIndex !== layerIndex);
  return filtered.map((answer) => ({
    ...answer,
    layerIndex: answer.layerIndex > layerIndex ? answer.layerIndex - 1 : answer.layerIndex,
  }));
}

export function shuffleArray(items = []) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildPlayerAssignments(answers = [], shuffledIds = []) {
  const layerCount = answers.length;
  const slots = Object.fromEntries(
    Array.from({ length: layerCount }, (_, index) => [index, null])
  );
  const pool = shuffledIds.filter((id) => answers.some((answer) => answer.id === id));
  return { slots, pool };
}

export function isLayerOrderCorrect(submittedOrder = [], correctOrder = []) {
  if (submittedOrder.length !== correctOrder.length) return false;
  return submittedOrder.every((id, index) => id === correctOrder[index]);
}

export function parseDragLayerAnswer(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}