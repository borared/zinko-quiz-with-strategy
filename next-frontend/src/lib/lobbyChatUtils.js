/** True when the message is composed entirely of emojis. */
export function isEmojiHeavy(text) {
  const stripped = String(text || '').replace(/\s/g, '');
  if (!stripped) return false;
  return /^[\p{Extended_Pictographic}\uFE0F\u200D]+$/u.test(stripped);
}