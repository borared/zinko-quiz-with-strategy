import { create } from 'zustand';
import { mergeQuizzesById } from './useDashboardQuizStore';

const DISCOVERY_CACHE_KEY = 'zinko_discovery_caches';

const cacheKey = (search) => search.trim();

function persistCaches(caches) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DISCOVERY_CACHE_KEY, JSON.stringify({ caches }));
  } catch {
    // Ignore quota or private mode errors.
  }
}

function clearPersistedCaches() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(DISCOVERY_CACHE_KEY);
}

function loadPersistedCaches() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DISCOVERY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.caches || typeof parsed.caches !== 'object') return null;

    const caches = {};
    for (const [key, entry] of Object.entries(parsed.caches)) {
      if (!entry?.isHydrated) continue;
      caches[key] = {
        quizzes: mergeQuizzesById([], entry.quizzes || []),
        nextCursor: entry.nextCursor ?? null,
        hasNextPage: entry.hasNextPage === true,
        isHydrated: true,
      };
    }

    return Object.keys(caches).length > 0 ? caches : null;
  } catch {
    return null;
  }
}

export const useDiscoveryQuizStore = create((set, get) => ({
  caches: {},
  isSessionHydrated: false,

  hydrateFromSession: () => {
    if (get().isSessionHydrated) return false;

    const persisted = loadPersistedCaches();
    if (!persisted) {
      set({ isSessionHydrated: true });
      return false;
    }

    set({ caches: persisted, isSessionHydrated: true });
    return true;
  },

  isCached: (search) => Boolean(get().caches[cacheKey(search)]?.isHydrated),

  getCache: (search) => get().caches[cacheKey(search)] ?? null,

  hasPersistedQuizzes: (search = '') => {
    const cache = get().caches[cacheKey(search)];
    return Boolean(cache?.isHydrated && cache.quizzes.length > 0);
  },

  setInitialCache: (search, { quizzes, nextCursor, hasNextPage }) => {
    const key = cacheKey(search);
    set((state) => {
      const nextCaches = {
        ...state.caches,
        [key]: {
          quizzes: mergeQuizzesById([], quizzes),
          nextCursor: nextCursor ?? null,
          hasNextPage: hasNextPage === true,
          isHydrated: true,
        },
      };
      persistCaches(nextCaches);
      return { caches: nextCaches };
    });
  },

  appendQuizzes: (search, { quizzes, nextCursor, hasNextPage }) => {
    const key = cacheKey(search);
    set((state) => {
      const prev = state.caches[key];
      if (!prev) return state;

      const nextCaches = {
        ...state.caches,
        [key]: {
          ...prev,
          quizzes: mergeQuizzesById(prev.quizzes, quizzes),
          nextCursor: nextCursor ?? null,
          hasNextPage: hasNextPage === true,
        },
      };
      persistCaches(nextCaches);
      return { caches: nextCaches };
    });
  },

  invalidate: () => {
    clearPersistedCaches();
    set({ caches: {}, isSessionHydrated: false });
  },

  markQuizCloned: (quizId) => {
    if (!quizId) return;
    set((state) => {
      const nextCaches = {};
      for (const [key, cache] of Object.entries(state.caches)) {
        nextCaches[key] = {
          ...cache,
          quizzes: cache.quizzes.map((quiz) =>
            quiz.id === quizId ? { ...quiz, already_cloned: true } : quiz
          ),
        };
      }
      persistCaches(nextCaches);
      return { caches: nextCaches };
    });
  },

  updateCreatorUsername: (clerkId, username) => {
    if (!clerkId) return;
    set((state) => {
      const nextCaches = {};
      for (const [key, cache] of Object.entries(state.caches)) {
        nextCaches[key] = {
          ...cache,
          quizzes: cache.quizzes.map((quiz) =>
            quiz.creator?.clerk_id === clerkId
              ? { ...quiz, creator: { ...quiz.creator, username } }
              : quiz
          ),
        };
      }
      persistCaches(nextCaches);
      return { caches: nextCaches };
    });
  },
}));