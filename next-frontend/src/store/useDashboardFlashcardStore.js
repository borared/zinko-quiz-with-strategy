import { create } from 'zustand';

const DASHBOARD_CACHE_KEY = 'zinko_dashboard_flashcards';

export function mergeDecksById(existing, incoming) {
  const seen = new Set(existing.map((d) => d.id));
  const merged = [...existing];
  for (const deck of incoming) {
    if (!deck?.id || seen.has(deck.id)) continue;
    seen.add(deck.id);
    merged.push(deck);
  }
  return merged;
}

function persistState(state) {
  if (typeof window === 'undefined' || !state.isHydrated || !state.userId) return;
  try {
    sessionStorage.setItem(
      DASHBOARD_CACHE_KEY,
      JSON.stringify({
        userId: state.userId,
        flashcardDecks: state.flashcardDecks,
        totalDeckCount: state.totalDeckCount,
        nextCursor: state.nextCursor,
        hasNextPage: state.hasNextPage,
        isHydrated: true,
      })
    );
  } catch {
    // Ignore quota or private mode errors.
  }
}

function clearPersistedState() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
}

function loadPersistedState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.userId || !parsed?.isHydrated) return null;
    return {
      userId: parsed.userId,
      flashcardDecks: mergeDecksById([], parsed.flashcardDecks || []),
      totalDeckCount: parsed.totalDeckCount ?? null,
      nextCursor: parsed.nextCursor ?? null,
      hasNextPage: parsed.hasNextPage === true,
      isHydrated: true,
    };
  } catch {
    return null;
  }
}

const EMPTY_STATE = {
  userId: null,
  flashcardDecks: [],
  totalDeckCount: null,
  nextCursor: null,
  hasNextPage: false,
  isHydrated: false,
};

export const useDashboardFlashcardStore = create((set, get) => ({
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

  hasPersistedDecks: () => {
    const state = get();
    return Boolean(state.isHydrated && state.flashcardDecks.length > 0);
  },

  setInitialCache: ({ userId, flashcardDecks, totalDeckCount, nextCursor, hasNextPage }) => {
    set({
      userId,
      flashcardDecks: mergeDecksById([], flashcardDecks),
      totalDeckCount,
      nextCursor: nextCursor ?? null,
      hasNextPage: hasNextPage === true,
      isHydrated: true,
    });
    persistState(get());
  },

  appendDecks: ({ flashcardDecks, nextCursor, hasNextPage }) => {
    set((state) => {
      const merged = mergeDecksById(state.flashcardDecks, flashcardDecks);
      const allLoaded =
        state.totalDeckCount != null && merged.length >= state.totalDeckCount;

      return {
        flashcardDecks: merged,
        nextCursor: nextCursor ?? null,
        hasNextPage: allLoaded ? false : hasNextPage === true,
      };
    });
    persistState(get());
  },

  removeDeck: (deckId) => {
    set((state) => ({
      flashcardDecks: state.flashcardDecks.filter((d) => d.id !== deckId),
      totalDeckCount:
        state.totalDeckCount != null
          ? Math.max(0, state.totalDeckCount - 1)
          : state.totalDeckCount,
    }));
    persistState(get());
  },

  invalidate: () => {
    clearPersistedState();
    set(EMPTY_STATE);
  },
}));
