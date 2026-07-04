import {
  getSceneryAudioSlugFromImage,
  halloweenScenerySessionKey,
  sceneryAudioSessionKey,
  SCENERY_AUDIO_SLUGS,
} from '@/lib/lobbyScenery';

const SCENERY_AUDIO_CONFIG = {
  halloween: {
    src: '/audio/halloween-ambience.mp3',
    volume: 0.42,
    label: 'Halloween',
  },
  inside: {
    src: '/audio/inside-ambience.mp3',
    volume: 0.38,
    label: 'Inside',
  },
};

const MUTE_STORAGE_KEY = 'zinko_scenery_audio_muted';

function dispatchSceneryAudioChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('sceneryAudioChanged'));
  window.dispatchEvent(new CustomEvent('halloweenAudioChanged'));
}

export function getSceneryAudioConfig(slug) {
  return SCENERY_AUDIO_CONFIG[slug] ?? null;
}

export function isSceneryAudioMuted() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(MUTE_STORAGE_KEY) === '1';
}

export function setSceneryAudioMuted(muted) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0');
}

export function getSceneryAudio() {
  if (typeof window === 'undefined') return null;
  return window.sceneryAudio ?? null;
}

export function getActiveSceneryAudioSlug() {
  if (typeof window === 'undefined') return null;
  return window.sceneryAudioSlug ?? null;
}

export function isSceneryAudioPlaying() {
  const audio = getSceneryAudio();
  return Boolean(audio && !audio.paused);
}

export function startSceneryAudio(slug) {
  if (typeof window === 'undefined') return;

  const config = SCENERY_AUDIO_CONFIG[slug];
  if (!config) return;

  stopSceneryAudio();

  const audio = new Audio(config.src);
  audio.loop = true;
  audio.volume = config.volume;
  window.sceneryAudio = audio;
  window.sceneryAudioSlug = slug;

  if (!isSceneryAudioMuted()) {
    audio.play().catch(() => {});
  }

  dispatchSceneryAudioChange();
}

export function stopSceneryAudio() {
  if (typeof window === 'undefined') return;

  const audio = getSceneryAudio();
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  window.sceneryAudio = null;
  window.sceneryAudioSlug = null;
  dispatchSceneryAudioChange();
}

export function toggleSceneryAudio() {
  const audio = getSceneryAudio();
  const slug = getActiveSceneryAudioSlug();

  if (!audio || !slug) {
    setSceneryAudioMuted(false);
    return false;
  }

  if (audio.paused) {
    setSceneryAudioMuted(false);
    audio.play().catch(() => {});
    dispatchSceneryAudioChange();
    return true;
  }

  audio.pause();
  setSceneryAudioMuted(true);
  dispatchSceneryAudioChange();
  return false;
}

export function syncSceneryAudioForImage(image, pin) {
  const slug = getSceneryAudioSlugFromImage(image);

  if (pin && typeof window !== 'undefined') {
    SCENERY_AUDIO_SLUGS.forEach((entry) => {
      sessionStorage.removeItem(sceneryAudioSessionKey(pin, entry));
    });
    if (slug) {
      sessionStorage.setItem(sceneryAudioSessionKey(pin, slug), '1');
    }
    sessionStorage.setItem(halloweenScenerySessionKey(pin), slug === 'halloween' ? '1' : '0');
  }

  if (slug) {
    startSceneryAudio(slug);
  } else {
    stopSceneryAudio();
    setSceneryAudioMuted(false);
  }
}

export function resumeSceneryAudioForPin(pin) {
  if (typeof window === 'undefined' || !pin) return false;

  const activeSlug = SCENERY_AUDIO_SLUGS.find(
    (slug) => sessionStorage.getItem(sceneryAudioSessionKey(pin, slug)) === '1'
  );

  if (activeSlug) {
    startSceneryAudio(activeSlug);
    return true;
  }

  if (sessionStorage.getItem(halloweenScenerySessionKey(pin)) === '1') {
    startSceneryAudio('halloween');
    return true;
  }

  return false;
}

export function clearSceneryAudioOnHostExit() {
  stopSceneryAudio();
  stopSceneryPreview();
  setSceneryAudioMuted(false);
}

export function playSceneryPreview(slug) {
  if (typeof window === 'undefined') return false;

  const config = SCENERY_AUDIO_CONFIG[slug];
  if (!config) return false;

  stopSceneryPreview();

  const audio = new Audio(config.src);
  audio.loop = true;
  audio.volume = config.volume;
  window.sceneryPreviewAudio = audio;
  window.sceneryPreviewSlug = slug;
  audio.play().catch(() => {});
  dispatchSceneryAudioChange();
  return true;
}

export function stopSceneryPreview() {
  if (typeof window === 'undefined') return;

  const audio = window.sceneryPreviewAudio;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  window.sceneryPreviewAudio = null;
  window.sceneryPreviewSlug = null;
  dispatchSceneryAudioChange();
}

export function toggleSceneryPreview(slug) {
  if (
    window.sceneryPreviewSlug === slug
    && window.sceneryPreviewAudio
    && !window.sceneryPreviewAudio.paused
  ) {
    stopSceneryPreview();
    return false;
  }

  playSceneryPreview(slug);
  return true;
}

export function isSceneryPreviewPlaying(slug) {
  return Boolean(
    window.sceneryPreviewSlug === slug
    && window.sceneryPreviewAudio
    && !window.sceneryPreviewAudio.paused
  );
}

export const isHalloweenAudioMuted = isSceneryAudioMuted;
export const setHalloweenAudioMuted = setSceneryAudioMuted;
export const getHalloweenAudio = getSceneryAudio;
export const isHalloweenAudioPlaying = isSceneryAudioPlaying;
export const startHalloweenAudio = () => startSceneryAudio('halloween');
export const stopHalloweenAudio = stopSceneryAudio;
export const toggleHalloweenAudio = toggleSceneryAudio;
export const syncHalloweenAudioForScenery = syncSceneryAudioForImage;
export const resumeHalloweenAudioForPin = resumeSceneryAudioForPin;
export const clearHalloweenAudioOnHostExit = clearSceneryAudioOnHostExit;