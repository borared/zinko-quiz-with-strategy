/** Shop + preview copy for purchasable lobby sceneries. */

export const SCENERY_LEVEL_CLASSES = {
  Epic: 'bg-zk-pink text-white',
  Rare: 'bg-zk-blue text-white',
  Elite: 'bg-white text-zk-black',
};

export const SCENERY_DETAILS = {
  halloween: {
    slug: 'halloween',
    level: 'Epic',
    tagline: 'Spooky lobby vibes for quiz night',
    description:
      'Turn your host lobby into a haunted hangout with a full-width Halloween backdrop and looping creepy ambience that players feel the moment they join.',
    perks: [
      'Exclusive Halloween lobby background',
      'Looping spooky ambience in host lobby and game',
      'Sound toggle so you control the mood',
      'Unlocks permanently for your account',
    ],
    audioSrc: '/audio/halloween-ambience.mp3',
    audioLabel: 'Spooky ambience',
    hasAudio: true,
  },
  inside: {
    slug: 'inside',
    level: 'Rare',
    tagline: 'Cozy interior mood for focused sessions',
    description:
      'A warm indoor backdrop with soft room-tone ambience — perfect when you want your lobby to feel intimate, calm, and a little cinematic.',
    perks: [
      'Exclusive Inside lobby background',
      'Looping indoor room-tone ambience in host lobby and game',
      'Sound toggle so you control the mood',
      'Unlocks permanently for your account',
    ],
    audioSrc: '/audio/inside-ambience.mp3',
    audioLabel: 'Indoor room tone',
    hasAudio: true,
  },
  'ghost-station': {
    slug: 'ghost-station',
    level: 'Elite',
    tagline: 'Haunted transit vibes for your quiz lobby',
    description:
      'A moody station backdrop that gives your host lobby a ghostly, cinematic edge — quiet, atmospheric, and ready for night sessions.',
    perks: [
      'Exclusive Ghost Station lobby background',
      'Atmospheric look for host lobby and game',
      'Unlocks permanently for your account',
      'Budget-friendly premium scenery',
    ],
    hasAudio: false,
  },
};

export function getSceneryDetails(slug) {
  return SCENERY_DETAILS[slug] ?? null;
}