import { isSceneryAudioMuted } from './sceneryAudio';

const GAME_AUDIO_CONFIG = {
  question: {
    src: '/audio/skill-pick-bgm.mp3',
    volume: 0.3,
  },
  leaderboard: {
    src: '/audio/leaderboard-bgm.mp3',
    volume: 0.35,
  },
  skillPick: {
    src: '/audio/skill-pick-bgm.mp3',
    volume: 0.3,
  },
  fivegrid: {
    src: '/audio/n2kstudio-music-for-game-fun-kid-game-163649.mp3',
    volume: 0.3,
  },
  wheel: {
    src: '/audio/wheel-spin.mp3',
    volume: 0.3,
  }
};

function dispatchGameAudioChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('gameAudioChanged'));
}

export function getActiveGameAudioType() {
  if (typeof window === 'undefined') return null;
  return window.gameAudioType ?? null;
}

export function startGameAudio(type) {
  if (typeof window === 'undefined') return;

  const config = GAME_AUDIO_CONFIG[type];
  if (!config) return;

  // Stop active game BGM
  stopGameAudio();

  const audio = new Audio(config.src);
  audio.loop = true;
  audio.volume = config.volume;
  window.gameAudio = audio;
  window.gameAudioType = type;

  // Only play if global scenery audio is not muted
  if (!isSceneryAudioMuted()) {
    audio.play().catch(() => {});
  }

  dispatchGameAudioChange();
}

export function stopGameAudio() {
  if (typeof window === 'undefined') return;

  const audio = window.gameAudio;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  window.gameAudio = null;
  window.gameAudioType = null;
  dispatchGameAudioChange();
}

export function syncGameAudioMuteState() {
  if (typeof window === 'undefined') return;
  const audio = window.gameAudio;
  if (!audio) return;

  if (isSceneryAudioMuted()) {
    audio.pause();
  } else {
    audio.play().catch(() => {});
  }
  dispatchGameAudioChange();
}
