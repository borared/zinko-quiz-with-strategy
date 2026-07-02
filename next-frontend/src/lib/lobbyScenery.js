/** Lobby background scenery catalog — unlocks are stored per user in the database. */
export const LOBBY_SCENERY = [
  {
    id: 'city',
    slug: 'city',
    name: 'City',
    image: '/background_battle/city.jpg',
    is_default: true,
  },
  {
    id: 'halloween',
    slug: 'halloween',
    name: 'Halloween',
    image: '/background_battle/halloween_scenery.jpg',
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

export function isHalloweenScenery(image) {
  return image === HALLOWEEN_SCENERY_IMAGE;
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