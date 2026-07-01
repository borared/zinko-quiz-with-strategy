import { halloweenScenerySessionKey, isHalloweenScenery } from '@/lib/lobbyScenery';

/** Halloween lobby/game ambience — Mixkit "Dark Shadows" (royalty-free). */
const HALLOWEEN_AUDIO_SRC = '/audio/halloween-ambience.mp3';
const MUTE_STORAGE_KEY = 'zinko_halloween_audio_muted';

function dispatchHalloweenAudioChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('halloweenAudioChanged'));
}

export function isHalloweenAudioMuted() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(MUTE_STORAGE_KEY) === '1';
}

export function setHalloweenAudioMuted(muted) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0');
}

export function getHalloweenAudio() {
  if (typeof window === 'undefined') return null;
  return window.halloweenAudio ?? null;
}

export function isHalloweenAudioPlaying() {
  const audio = getHalloweenAudio();
  return Boolean(audio && !audio.paused);
}

export function startHalloweenAudio() {
  if (typeof window === 'undefined') return;

  let audio = window.halloweenAudio;
  if (!audio) {
    audio = new Audio(HALLOWEEN_AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.42;
    window.halloweenAudio = audio;
  }

  if (!isHalloweenAudioMuted()) {
    audio.play().catch(() => {});
  }

  dispatchHalloweenAudioChange();
}

export function stopHalloweenAudio() {
  if (typeof window === 'undefined') return;

  const audio = window.halloweenAudio;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    window.halloweenAudio = null;
  }

  dispatchHalloweenAudioChange();
}

export function toggleHalloweenAudio() {
  const audio = getHalloweenAudio();
  if (!audio) {
    setHalloweenAudioMuted(false);
    startHalloweenAudio();
    return true;
  }

  if (audio.paused) {
    setHalloweenAudioMuted(false);
    audio.play().catch(() => {});
    dispatchHalloweenAudioChange();
    return true;
  }

  audio.pause();
  setHalloweenAudioMuted(true);
  dispatchHalloweenAudioChange();
  return false;
}

export function syncHalloweenAudioForScenery(image, pin) {
  const isHalloween = isHalloweenScenery(image);

  if (pin && typeof window !== 'undefined') {
    sessionStorage.setItem(halloweenScenerySessionKey(pin), isHalloween ? '1' : '0');
  }

  if (isHalloween) {
    startHalloweenAudio();
  } else {
    stopHalloweenAudio();
    setHalloweenAudioMuted(false);
  }
}

export function resumeHalloweenAudioForPin(pin) {
  if (typeof window === 'undefined' || !pin) return false;
  const active = sessionStorage.getItem(halloweenScenerySessionKey(pin)) === '1';
  if (active) startHalloweenAudio();
  return active;
}

export function clearHalloweenAudioOnHostExit() {
  stopHalloweenAudio();
  setHalloweenAudioMuted(false);
}