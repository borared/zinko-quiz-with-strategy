/** True when the message is emoji-only (no letters/numbers). */
export function isEmojiHeavy(text) {
  const stripped = String(text || '').replace(/\s/g, '');
  if (!stripped) return false;
  return !/[a-zA-Z0-9]/.test(stripped);
}