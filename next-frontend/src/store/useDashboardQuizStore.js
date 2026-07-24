import { create } from 'zustand';

const DASHBOARD_CACHE_KEY = 'zinko_dashboard_quizzes';

export function mergeQuizzesById(existing, incoming) {
  const seen = new Set(existing.map((q) => q.id));
  const merged = [...existing];
  for (const quiz of incoming) {
    if (!quiz?.id || seen.has(quiz.id)) continue;
    seen.add(quiz.id);
    merged.push(quiz);
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
        quizzes: state.quizzes,
        totalQuizCount: state.totalQuizCount,
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
      quizzes: mergeQuizzesById([], parsed.quizzes || []),
      totalQuizCount: parsed.totalQuizCount ?? null,
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
  quizzes: [],
  totalQuizCount: null,
  nextCursor: null,
  hasNextPage: false,
  isHydrated: false,
};

export const useDashboardQuizStore = create((set, get) => ({
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

  hasPersistedQuizzes: () => {
    const state = get();
    return Boolean(state.isHydrated && state.quizzes.length > 0);
  },

  setInitialCache: ({ userId, quizzes, totalQuizCount, nextCursor, hasNextPage }) => {
    set({
      userId,
      quizzes: mergeQuizzesById([], quizzes),
      totalQuizCount,
      nextCursor: nextCursor ?? null,
      hasNextPage: hasNextPage === true,
      isHydrated: true,
    });
    persistState(get());
  },

  appendQuizzes: ({ quizzes, nextCursor, hasNextPage }) => {
    set((state) => {
      const merged = mergeQuizzesById(state.quizzes, quizzes);
      const allLoaded =
        state.totalQuizCount != null && merged.length >= state.totalQuizCount;

      return {
        quizzes: merged,
        nextCursor: nextCursor ?? null,
        hasNextPage: allLoaded ? false : hasNextPage === true,
      };
    });
    persistState(get());
  },

  removeQuiz: (quizId) => {
    set((state) => ({
      quizzes: state.quizzes.filter((q) => q.id !== quizId),
      totalQuizCount:
        state.totalQuizCount != null
          ? Math.max(0, state.totalQuizCount - 1)
          : state.totalQuizCount,
    }));
    persistState(get());
  },

  invalidate: () => {
    clearPersistedState();
    set(EMPTY_STATE);
  },
}));