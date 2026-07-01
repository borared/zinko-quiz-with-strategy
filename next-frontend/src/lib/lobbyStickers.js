/** Custom lobby taunt stickers — Zinko mascot style, transparent (no bg box). */
export const LOBBY_STICKERS = {
  '😂': {
    type: 'zinko-laugh',
    src: '/images/stickers/laugh-zinko.svg',
    alt: 'Person laughing out loud',
    label: 'LOL',
  },
};

export function getLobbySticker(emoji) {
  if (!emoji) return null;
  return LOBBY_STICKERS[emoji] ?? null;
}

/** True when message is a single emoji that maps to a custom sticker. */
export function isStickerReaction(message) {
  const trimmed = String(message || '').trim();
  if (!trimmed) return false;
  const match = trimmed.match(/^\p{Extended_Pictographic}$/u);
  return Boolean(match && LOBBY_STICKERS[match[0]]);
}