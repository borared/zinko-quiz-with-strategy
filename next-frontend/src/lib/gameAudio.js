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
    src: '/audio/lobby-funk.mp3',
    volume: 0.3,
  },
  // Funkorama — Kevin MacLeod (incompetech.com), CC BY 3.0
  // Same funk family as lobby Vivacity / skill-pick Super Power Cool Dude.
  wheel: {
    src: '/audio/wheel-bgm.mp3',
    volume: 0.3,
  }
};

const GAME_SFX = {
  wheelSpin: { src: '/audio/wheel-spin-sfx.mp3', volume: 0.72 },
  wheelWin: { src: '/audio/wheel-win.mp3', volume: 0.78 },
  wheelLose: { src: '/audio/wheel-lose.mp3', volume: 0.68 },
};

const WHEEL_BGM_DUCK_VOLUME = 0.1;

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

  // If the same BGM type is already active and playing, keep it playing smoothly without restart
  if (window.gameAudioType === type && window.gameAudio) {
    return;
  }

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

export function playGameSfx(name) {
  if (typeof window === 'undefined') return null;
  if (isSceneryAudioMuted()) return null;

  const config = GAME_SFX[name];
  if (!config) return null;

  try {
    const clip = new Audio(config.src);
    clip.volume = config.volume;
    clip.play().catch(() => {});
    return clip;
  } catch {
    return null;
  }
}

export function duckGameAudio() {
  if (typeof window === 'undefined' || !window.gameAudio) return;
  window.gameAudio.volume = WHEEL_BGM_DUCK_VOLUME;
}

export function restoreGameAudioVolume() {
  if (typeof window === 'undefined' || !window.gameAudio) return;
  const type = window.gameAudioType;
  const config = type ? GAME_AUDIO_CONFIG[type] : null;
  window.gameAudio.volume = config?.volume ?? 0.3;
}
