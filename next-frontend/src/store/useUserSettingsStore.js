import { create } from 'zustand';
import { DEFAULT_USER_SETTINGS } from '@/lib/userSettings';

const DEFAULT_USAGE = { quizzesCreated: 0, plan: 'basic' };

export const useUserSettingsStore = create((set, get) => ({
  userId: null,
  settings: DEFAULT_USER_SETTINGS,
  usage: DEFAULT_USAGE,
  username: '',
  isHydrated: false,

  isCachedForUser: (userId) => {
    const state = get();
    return Boolean(userId && state.isHydrated && state.userId === userId);
  },

  setCache: ({ userId, settings, usage, username }) =>
    set({
      userId,
      settings: settings || DEFAULT_USER_SETTINGS,
      usage: usage || DEFAULT_USAGE,
      username: username || '',
      isHydrated: true,
    }),

  updateSettings: (settings) => set({ settings: settings || DEFAULT_USER_SETTINGS }),

  updateUsage: (usage) => set({ usage: usage || DEFAULT_USAGE }),

  updateUsername: (username) => set({ username: username || '' }),

  invalidate: () =>
    set({
      userId: null,
      settings: DEFAULT_USER_SETTINGS,
      usage: DEFAULT_USAGE,
      username: '',
      isHydrated: false,
    }),
}));