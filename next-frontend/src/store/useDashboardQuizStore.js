import { create } from 'zustand';

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

export const useDashboardQuizStore = create((set, get) => ({
  userId: null,
  quizzes: [],
  totalQuizCount: null,
  nextCursor: null,
  hasNextPage: false,
  isHydrated: false,

  isCachedForUser: (userId) => {
    const state = get();
    return Boolean(userId && state.isHydrated && state.userId === userId);
  },

  setInitialCache: ({ userId, quizzes, totalQuizCount, nextCursor, hasNextPage }) =>
    set({
      userId,
      quizzes: mergeQuizzesById([], quizzes),
      totalQuizCount,
      nextCursor: nextCursor ?? null,
      hasNextPage: hasNextPage === true,
      isHydrated: true,
    }),

  appendQuizzes: ({ quizzes, nextCursor, hasNextPage }) =>
    set((state) => {
      const merged = mergeQuizzesById(state.quizzes, quizzes);
      const allLoaded =
        state.totalQuizCount != null && merged.length >= state.totalQuizCount;

      return {
        quizzes: merged,
        nextCursor: nextCursor ?? null,
        hasNextPage: allLoaded ? false : hasNextPage === true,
      };
    }),

  removeQuiz: (quizId) =>
    set((state) => ({
      quizzes: state.quizzes.filter((q) => q.id !== quizId),
      totalQuizCount:
        state.totalQuizCount != null
          ? Math.max(0, state.totalQuizCount - 1)
          : state.totalQuizCount,
    })),

  invalidate: () =>
    set({
      userId: null,
      quizzes: [],
      totalQuizCount: null,
      nextCursor: null,
      hasNextPage: false,
      isHydrated: false,
    }),
}));