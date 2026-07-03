const DEFAULT_USER_SETTINGS = {
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

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeSettings(stored = {}) {
  const source = isPlainObject(stored) ? stored : {};
  return {
    notifications: {
      ...DEFAULT_USER_SETTINGS.notifications,
      ...(isPlainObject(source.notifications) ? source.notifications : {}),
    },
    privacy: {
      ...DEFAULT_USER_SETTINGS.privacy,
      ...(isPlainObject(source.privacy) ? source.privacy : {}),
    },
    discoveryOptIn: typeof source.discoveryOptIn === 'boolean'
      ? source.discoveryOptIn
      : DEFAULT_USER_SETTINGS.discoveryOptIn,
  };
}

function sanitizePatch(patch = {}) {
  if (!isPlainObject(patch)) return {};

  const next = {};

  if (isPlainObject(patch.notifications)) {
    next.notifications = {};
    if (typeof patch.notifications.sceneryGifts === 'boolean') {
      next.notifications.sceneryGifts = patch.notifications.sceneryGifts;
    }
    if (typeof patch.notifications.quizActivity === 'boolean') {
      next.notifications.quizActivity = patch.notifications.quizActivity;
    }
    if (typeof patch.notifications.emailDigest === 'boolean') {
      next.notifications.emailDigest = patch.notifications.emailDigest;
    }
  }

  if (isPlainObject(patch.privacy)) {
    next.privacy = {};
    if (patch.privacy.defaultQuizVisibility === 'public' || patch.privacy.defaultQuizVisibility === 'private') {
      next.privacy.defaultQuizVisibility = patch.privacy.defaultQuizVisibility;
    }
    if (typeof patch.privacy.showOnDiscovery === 'boolean') {
      next.privacy.showOnDiscovery = patch.privacy.showOnDiscovery;
    }
    if (typeof patch.privacy.allowQuizCloning === 'boolean') {
      next.privacy.allowQuizCloning = patch.privacy.allowQuizCloning;
    }
  }

  if (typeof patch.discoveryOptIn === 'boolean') {
    next.discoveryOptIn = patch.discoveryOptIn;
  }

  return next;
}

module.exports = {
  DEFAULT_USER_SETTINGS,
  mergeSettings,
  sanitizePatch,
};