import { create } from 'zustand';
import { mergeQuizzesById } from './useDashboardQuizStore';

const cacheKey = (search) => search.trim();

export const useDiscoveryQuizStore = create((set, get) => ({
  caches: {},

  isCached: (search) => Boolean(get().caches[cacheKey(search)]?.isHydrated),

  getCache: (search) => get().caches[cacheKey(search)] ?? null,

  setInitialCache: (search, { quizzes, nextCursor, hasNextPage }) => {
    const key = cacheKey(search);
    set((state) => ({
      caches: {
        ...state.caches,
        [key]: {
          quizzes: mergeQuizzesById([], quizzes),
          nextCursor: nextCursor ?? null,
          hasNextPage: hasNextPage === true,
          isHydrated: true,
        },
      },
    }));
  },

  appendQuizzes: (search, { quizzes, nextCursor, hasNextPage }) => {
    const key = cacheKey(search);
    set((state) => {
      const prev = state.caches[key];
      if (!prev) return state;
      return {
        caches: {
          ...state.caches,
          [key]: {
            ...prev,
            quizzes: mergeQuizzesById(prev.quizzes, quizzes),
            nextCursor: nextCursor ?? null,
            hasNextPage: hasNextPage === true,
          },
        },
      };
    });
  },
}));