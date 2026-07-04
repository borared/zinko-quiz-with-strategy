import { create } from 'zustand';
import api from '../services/api';

const SHOP_CACHE_KEY = 'zinko_shop_catalog';

function persistState(state) {
  if (typeof window === 'undefined' || !state.isHydrated || !state.userId) return;
  try {
    sessionStorage.setItem(
      SHOP_CACHE_KEY,
      JSON.stringify({
        userId: state.userId,
        sceneries: state.sceneries,
        avatars: state.avatars,
        isHydrated: true,
      })
    );
  } catch {
    // Ignore quota or private mode errors.
  }
}

function clearPersistedState() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SHOP_CACHE_KEY);
}

function loadPersistedState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SHOP_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.userId || !parsed?.isHydrated) return null;
    return {
      userId: parsed.userId,
      sceneries: Array.isArray(parsed.sceneries) ? parsed.sceneries : [],
      avatars: Array.isArray(parsed.avatars) ? parsed.avatars : [],
      isHydrated: true,
    };
  } catch {
    return null;
  }
}

const EMPTY_STATE = {
  userId: null,
  sceneries: [],
  avatars: [],
  isLoading: false,
  isHydrated: false,
  isCheckingOut: false,
  activeTab: 'scenery',
};

export const useShopStore = create((set, get) => ({
  ...EMPTY_STATE,

  setActiveTab: (tab) => set({ activeTab: tab }),

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

  hasPersistedCatalog: () => {
    const state = get();
    return Boolean(
      state.isHydrated && (state.sceneries.length > 0 || state.avatars.length > 0)
    );
  },

  setCatalogCache: ({ userId, sceneries, avatars }) => {
    set({
      userId,
      sceneries: Array.isArray(sceneries) ? sceneries : [],
      avatars: Array.isArray(avatars) ? avatars : [],
      isHydrated: true,
      isLoading: false,
    });
    persistState(get());
  },

  invalidate: () => {
    clearPersistedState();
    set(EMPTY_STATE);
  },

  fetchCatalog: async ({ silent = false, userId } = {}) => {
    if (!localStorage.getItem('zinko_jwt')) {
      get().invalidate();
      return null;
    }

    if (get().isLoading) return get();

    const hasCachedCatalog = get().hasPersistedCatalog();
    if (!silent && !hasCachedCatalog) {
      set({ isLoading: true });
    }

    try {
      const data = await api.get('/api/shop/catalog');
      const resolvedUserId = userId || get().userId;

      set({
        userId: resolvedUserId,
        sceneries: Array.isArray(data?.sceneries) ? data.sceneries : [],
        avatars: Array.isArray(data?.avatars) ? data.avatars : [],
        isLoading: false,
        isHydrated: true,
      });
      persistState(get());
      return data;
    } catch (error) {
      console.error('Failed to fetch shop catalog:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  startCheckout: async (itemType, slug) => {
    if (get().isCheckingOut) return null;

    set({ isCheckingOut: true });
    try {
      const result = await api.post('/api/shop/checkout', { itemType, slug });
      set({ isCheckingOut: false });
      return result;
    } catch (error) {
      set({ isCheckingOut: false });
      throw error;
    }
  },
}));