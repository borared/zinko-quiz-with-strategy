const REACTIONS_BASE = '/audio/reactions';

// Pre-load voices for TTS so high-quality ones are ready when needed
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

/** Unique taunt SFX per quick-reaction emoji (Mixkit, free license). */
export const EMOJI_SOUND_MAP = {
  '😂': `${REACTIONS_BASE}/laugh.mp3`,
  '🤡': `${REACTIONS_BASE}/clown.mp3`,
  '💀': `${REACTIONS_BASE}/skull.mp3`,
  '👀': `${REACTIONS_BASE}/eyes.mp3`,
  '🔥': `${REACTIONS_BASE}/fire.mp3`,
  '😤': `${REACTIONS_BASE}/grunt.mp3`,
  '🙄': `${REACTIONS_BASE}/sigh.mp3`,
  '🫵': `${REACTIONS_BASE}/ding.mp3`,
  '💪': `${REACTIONS_BASE}/strong.mp3`,
  '😴': `${REACTIONS_BASE}/snore.mp3`,
  '🗿': `${REACTIONS_BASE}/stone.mp3`,
  '👑': `${REACTIONS_BASE}/royal.mp3`,
};


/** Per-emoji volume tweaks (voiced laughs need a little more punch). */
const EMOJI_VOLUME_MAP = {
  '😂': 0.85,
};

function getPrimaryEmoji(text) {
  const trimmed = String(text || '').trim();
  const match = trimmed.match(/\p{Extended_Pictographic}/u);
  return match ? match[0] : null;
}

export function getEmojiReactionSound(message) {
  const primary = getPrimaryEmoji(message);
  if (primary && EMOJI_SOUND_MAP[primary]) {
    return EMOJI_SOUND_MAP[primary];
  }
  return null;
}

/** Play the matching mock/taunt sound when an emoji appears on an avatar. */
export function playEmojiReactionSound(message) {
  if (typeof window === 'undefined') return;

  try {
    const src = getEmojiReactionSound(message);
    if (!src) return;
    
    const primary = getPrimaryEmoji(message);
    const clip = new Audio(src);
    clip.volume = EMOJI_VOLUME_MAP[primary] ?? 0.65;
    clip.play().catch(() => {});
  } catch {
    // Autoplay policies or missing file — fail silently
  }
}

/** Play text-to-speech for text messages in lobby chat */
export function playTextToSpeech(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to grab the most "human-sounding" voice available in the user's browser
    const voices = window.speechSynthesis.getVoices();
    
    // Browsers like Edge/Chrome have high-quality neural/cloud voices that sound very real.
    // We prioritize those over the default robotic OS voices.
    const bestVoice = 
      voices.find(v => v.name.includes('Natural') || v.name.includes('Online')) ||
      voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
      voices.find(v => v.name.includes('Premium') || v.name.includes('Enhanced')) ||
      voices.find(v => v.lang === 'en-US');

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 
    window.speechSynthesis.speak(utterance);
  } catch {
    // Fail silently
  }
}