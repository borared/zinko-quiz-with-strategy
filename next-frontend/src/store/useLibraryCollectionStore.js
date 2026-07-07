import { create } from 'zustand';
import api from '../services/api';

const LIBRARY_CACHE_KEY = 'zinko_library_collection';

function normalizeScenery(scenery) {
  return {
    item_type: 'scenery',
    slug: scenery.slug || scenery.id,
    name: scenery.name,
    image: scenery.image || scenery.image_url,
    is_default: scenery.is_default,
  };
}

function normalizeAvatar(avatar) {
  return {
    item_type: 'avatar',
    slug: avatar.slug,
    name: avatar.label || avatar.name || avatar.slug,
    image: avatar.image_url,
    is_free: avatar.is_free,
  };
}

function persistState(state) {
  if (typeof window === 'undefined' || !state.isHydrated || !state.userId) return;
  try {
    sessionStorage.setItem(
      LIBRARY_CACHE_KEY,
      JSON.stringify({
        userId: state.userId,
        sceneryItems: state.sceneryItems,
        avatarItems: state.avatarItems,
        isHydrated: true,
      })
    );
  } catch {
    // Ignore quota or private mode errors.
  }
}

function clearPersistedState() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(LIBRARY_CACHE_KEY);
}

function loadPersistedState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LIBRARY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.userId || !parsed?.isHydrated) return null;
    return {
      userId: parsed.userId,
      sceneryItems: Array.isArray(parsed.sceneryItems) ? parsed.sceneryItems : [],
      avatarItems: Array.isArray(parsed.avatarItems) ? parsed.avatarItems : [],
      isHydrated: true,
    };
  } catch {
    return null;
  }
}

const EMPTY_STATE = {
  userId: null,
  sceneryItems: [],
  avatarItems: [],
  isLoading: false,
  isHydrated: false,
};

export const useLibraryCollectionStore = create((set, get) => ({
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

  hasPersistedCollection: () => Boolean(get().isHydrated),

  invalidate: () => {
    clearPersistedState();
    set(EMPTY_STATE);
  },

  fetchCollection: async ({ silent = false, userId } = {}) => {
    if (!localStorage.getItem('zinko_jwt')) {
      get().invalidate();
      return null;
    }

    if (get().isLoading) return get();

    const hasCachedCollection = get().hasPersistedCollection();
    if (!silent && !hasCachedCollection) {
      set({ isLoading: true });
    }

    try {
      const [sceneryResult, avatarsResult] = await Promise.allSettled([
        api.get('/api/sceneries/owned'),
        api.get('/api/avatars'),
      ]);

      let sceneryItems = get().sceneryItems;
      let sceneryFailed = false;
      if (sceneryResult.status === 'fulfilled') {
        const sceneries = Array.isArray(sceneryResult.value?.sceneries)
          ? sceneryResult.value.sceneries
          : [];
        sceneryItems = sceneries.map(normalizeScenery);
      } else {
        sceneryFailed = true;
      }

      let avatarItems = get().avatarItems;
      let avatarsFailed = false;
      if (avatarsResult.status === 'fulfilled') {
        const { data, success } = avatarsResult.value ?? {};
        if (success && Array.isArray(data)) {
          avatarItems = data.map(normalizeAvatar);
        }
      } else {
        avatarsFailed = true;
      }

      const resolvedUserId = userId || get().userId;

      set({
        userId: resolvedUserId,
        sceneryItems,
        avatarItems,
        isHydrated: true,
        isLoading: false,
      });
      persistState(get());

      return {
        sceneryItems,
        avatarItems,
        avatarsFailed,
        sceneryFailed,
      };
    } catch (error) {
      console.error('Failed to fetch library collection:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));