export const DEFAULT_USER_SETTINGS = {
  notifications: {
    sceneryGifts: true,
    quizActivity: true,
    emailDigest: false,
  },
  privacy: {
    defaultQuizVisibility: 'private',
    showOnDiscovery: true,
    allowQuizCloning: true,
  },
  discoveryOptIn: true,
};

export const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' },
];

export const PLAN_COPY = {
  basic: {
    title: 'Basic',
    price: 'Free',
    subtitle: 'Perfect for starting your game journey.',
  },
  pro: {
    title: 'Pro',
    price: '$6.99/mo',
    subtitle: 'Unlock the full power of play.',
  },
  school: {
    title: 'School',
    price: 'Custom',
    subtitle: 'Empower your entire department.',
  },
};