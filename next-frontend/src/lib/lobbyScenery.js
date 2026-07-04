/** Lobby background scenery catalog — unlocks are stored per user in the database. */
export const LOBBY_SCENERY = [
  {
    id: 'city',
    slug: 'city',
    name: 'City',
    image: 'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/city.jpg',
    is_default: true,
  },
  {
    id: 'halloween',
    slug: 'halloween',
    name: 'Halloween',
    image: 'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/halloween_scenery.jpg',
    is_default: false,
  },
  {
    id: 'inside',
    slug: 'inside',
    name: 'Inside',
    image: 'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/inside_scenery.jpg',
    is_default: false,
  },
  {
    id: 'ghost-station',
    slug: 'ghost-station',
    name: 'Ghost Station',
    image: 'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/ghost_station.jpg',
    is_default: false,
  },
];

export function getSceneryByImage(image, ownedScenery = LOBBY_SCENERY) {
  return ownedScenery.find((s) => s.image === image)
    ?? LOBBY_SCENERY.find((s) => s.image === image)
    ?? null;
}

export function isOwnedSceneryImage(image, ownedScenery = LOBBY_SCENERY) {
  return ownedScenery.some((s) => s.image === image);
}

export const DEFAULT_LOBBY_SCENERY = LOBBY_SCENERY[0].image;

export const HALLOWEEN_SCENERY_IMAGE = LOBBY_SCENERY.find((s) => s.id === 'halloween')?.image ?? '';
export const INSIDE_SCENERY_IMAGE = LOBBY_SCENERY.find((s) => s.id === 'inside')?.image ?? '';

const LEGACY_HALLOWEEN_SCENERY_IMAGE = '/background_battle/halloween_scenery.jpg';

export const SCENERY_AUDIO_SLUGS = ['halloween', 'inside'];

export function isHalloweenScenery(image) {
  return image === HALLOWEEN_SCENERY_IMAGE || image === LEGACY_HALLOWEEN_SCENERY_IMAGE;
}

export function isInsideScenery(image) {
  return image === INSIDE_SCENERY_IMAGE;
}

export function getSceneryAudioSlugFromImage(image) {
  if (isHalloweenScenery(image)) return 'halloween';
  if (isInsideScenery(image)) return 'inside';
  return null;
}

export function sceneryAudioSessionKey(pin, slug) {
  return `game_${pin}_scenery_audio_${slug}`;
}

export function gameBackgroundSessionKey(pin) {
  return `game_${pin}_background`;
}

export function getStoredGameBackground(pin) {
  if (typeof window === 'undefined' || !pin) return DEFAULT_LOBBY_SCENERY;
  return sessionStorage.getItem(gameBackgroundSessionKey(pin)) || DEFAULT_LOBBY_SCENERY;
}

export function setStoredGameBackground(pin, image) {
  if (typeof window === 'undefined' || !pin || !image) return;
  sessionStorage.setItem(gameBackgroundSessionKey(pin), image);
}

/** Shared battle-phase background styling for host and player screens. */
export function battleBackgroundStyle(image, fallbackColor = '#C4962C') {
  return {
    backgroundImage: `url('${image || DEFAULT_LOBBY_SCENERY}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: fallbackColor,
  };
}

export function halloweenScenerySessionKey(pin) {
  return `game_${pin}_halloween_scenery`;
}

export const ZINKO_SENDER_AVATAR = '/Zinkofavicon.png';
export const ZINKO_SENDER_NAME = 'Zinko';