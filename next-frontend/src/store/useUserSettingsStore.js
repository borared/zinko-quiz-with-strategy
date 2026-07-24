import { create } from 'zustand';
import { DEFAULT_USER_SETTINGS } from '@/lib/userSettings';

const SETTINGS_CACHE_KEY = 'zinko_user_settings';

const DEFAULT_USAGE = { quizzesCreated: 0, plan: 'basic' };

const EMPTY_STATE = {
  userId: null,
  settings: DEFAULT_USER_SETTINGS,
  usage: DEFAULT_USAGE,
  username: '',
  isHydrated: false,
};

function persistState(state) {
  if (typeof window === 'undefined' || !state.isHydrated || !state.userId) return;
  try {
    sessionStorage.setItem(
      SETTINGS_CACHE_KEY,
      JSON.stringify({
        userId: state.userId,
        settings: state.settings,
        usage: state.usage,
        username: state.username,
        isHydrated: true,
      })
    );
  } catch {
    // Ignore quota or private mode errors.
  }
}

function clearPersistedState() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SETTINGS_CACHE_KEY);
}

function loadPersistedState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SETTINGS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.userId || !parsed?.isHydrated) return null;
    return {
      userId: parsed.userId,
      settings: parsed.settings || DEFAULT_USER_SETTINGS,
      usage: parsed.usage || DEFAULT_USAGE,
      username: parsed.username || '',
      isHydrated: true,
    };
  } catch {
    return null;
  }
}

export const useUserSettingsStore = create((set, get) => ({
  ...EMPTY_STATE,

  hydrateFromSession: () => {
    const state = get();
    if (state.isHydrated) return false;

    const persisted = loadPersistedState();
    if (!persisted) return false;

    set(persisted);
    return true;
  },

  isCachedForUser: (userId) => {
    const state = get();
    return Boolean(userId && state.isHydrated && state.userId === userId);
  },

  hasPersistedSettings: () => Boolean(get().isHydrated),

  setCache: ({ userId, settings, usage, username }) => {
    set({
      userId,
      settings: settings || DEFAULT_USER_SETTINGS,
      usage: usage || DEFAULT_USAGE,
      username: username || '',
      isHydrated: true,
    });
    persistState(get());
  },

  updateSettings: (settings) => {
    set({ settings: settings || DEFAULT_USER_SETTINGS });
    persistState(get());
  },

  updateUsage: (usage) => {
    set({ usage: usage || DEFAULT_USAGE });
    persistState(get());
  },

  updateUsername: (username) => {
    set({ username: username || '' });
    persistState(get());
  },

  invalidate: () => {
    clearPersistedState();
    set(EMPTY_STATE);
  },
}));