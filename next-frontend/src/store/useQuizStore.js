import { create } from 'zustand';
import { useDashboardQuizStore } from './useDashboardQuizStore';
import api from '../services/api';
import {
  QUESTION_TYPES,
  convertQuestionType,
  createMultipleChoiceAnswers,
  resolveQuestionType,
} from '@/lib/questionTypes';
import { formatAiQuestions } from '@/lib/formatAiQuestions';
import { answersToPairs } from '@/lib/lineMatchingUtils';
import { getCorrectLayerOrder } from '@/lib/dragLayersUtils';
import { DEFAULT_TIME_LIMIT, normalizeTimeLimit } from '@/lib/timeLimit';
import { formatQuestionForSave, validateQuizForSave } from '@/lib/validateQuizSave';

export const QUIZ_TITLE_MAX_LENGTH = 15;

function normalizeRound(round) {
  const parsed = Number(round);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

function getRoundQuestions(questions, round) {
  const normalizedRound = normalizeRound(round);
  return questions.filter((question) => normalizeRound(question.round) === normalizedRound);
}

function pickActiveQuestionIdForRound(questions, round, currentActiveId = null) {
  const roundQuestions = getRoundQuestions(questions, round);
  if (roundQuestions.some((question) => question.id === currentActiveId)) {
    return currentActiveId;
  }
  return roundQuestions[0]?.id ?? null;
}

export const useQuizStore = create((set, get) => ({
  questions: [],
  deletedQuestions: [],
  activeQuestionId: null,
  activeRound: 1,
  quizTitle: '',
  coverImage: null,
  isSaving: false,
  loading: false,

  setActiveQuestionId: (id) => set({ activeQuestionId: id }),
  setActiveRound: (round) => set((state) => {
    const nextRound = normalizeRound(round);
    return {
      activeRound: nextRound,
      activeQuestionId: pickActiveQuestionIdForRound(
        state.questions,
        nextRound,
        state.activeQuestionId
      ),
    };
  }),
  setQuizTitle: (title) =>
    set({ quizTitle: String(title).slice(0, QUIZ_TITLE_MAX_LENGTH) }),
  setCoverImage: (image) => set({ coverImage: image }),
  resetQuiz: () => set({
    questions: [],
    deletedQuestions: [],
    activeQuestionId: null,
    activeRound: 1,
    quizTitle: '',
    coverImage: null,
    isSaving: false,
    loading: false
  }),
  setQuestions: (questions) => {
    if (typeof questions === 'function') {
      set((state) => ({ questions: questions(state.questions) }));
    } else {
      set({ questions });
    }
  },

  fetchQuiz: async (quizId, showToast) => {
    if (!quizId) return;
    try {
      set({ loading: true });
      const data = await api.get(`/api/quizzes/${quizId}`);
      set({ quizTitle: data.title, coverImage: data.cover_image });

      const formattedQuestions = data.questions.map((q) => {
        const questionType = resolveQuestionType({
          question_type: q.question_type,
          questionType: q.question_type,
          answers: q.answers || [],
        });

        const answers = (q.answers || []).map((ans, index) => {
          const base = {
            ...ans,
            checked: !!ans.isCorrect,
          };

          if (questionType === QUESTION_TYPES.DRAG_LAYERS) {
            return {
              ...base,
              layerIndex: Number.isInteger(ans.layerIndex) ? ans.layerIndex : index,
            };
          }

          if (questionType === QUESTION_TYPES.LINE_MATCHING) {
            return {
              ...base,
              side: ans.side,
              matchId: ans.matchId,
              pairIndex: Number.isInteger(ans.pairIndex) ? ans.pairIndex : undefined,
            };
          }

          return base;
        });

        return {
          id: q.id,
          text: q.question_text,
          answers,
          questionType,
          image: q.image_url,
          round: normalizeRound(q.round),
          time_limit: normalizeTimeLimit(q.time_limit),
        };
      });

      const initialRound = 1;
      set({
        questions: formattedQuestions,
        activeRound: initialRound,
        activeQuestionId: pickActiveQuestionIdForRound(
          formattedQuestions,
          initialRound
        ),
      });
    } catch {
      if (showToast) showToast('Failed to load quiz data', 'error');
    } finally {
      set({ loading: false });
    }
  },

  handleAddQuestion: () => {
    const state = get();
    const newId = Date.now();
    const newQuestion = {
      id: newId,
      text: '',
      round: normalizeRound(state.activeRound),
      questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
      answers: createMultipleChoiceAnswers('A'),
      image: null,
      time_limit: DEFAULT_TIME_LIMIT,
    };
    set((state) => ({
      questions: [...state.questions, newQuestion],
      activeQuestionId: newId
    }));
  },

  updateActiveQuestion: (updates) => {
    set((state) => ({
      questions: state.questions.map(q =>
        q.id === state.activeQuestionId ? { ...q, ...updates } : q
      )
    }));
  },

  setActiveQuestionType: (questionType) => {
    set((state) => ({
      questions: state.questions.map((question) => {
        if (question.id !== state.activeQuestionId) return question;
        return {
          ...question,
          questionType,
          answers: convertQuestionType(
            question.questionType || QUESTION_TYPES.MULTIPLE_CHOICE,
            questionType,
            question.answers
          ),
        };
      }),
    }));
  },

  deleteQuestion: (id) => {
    set((state) => {
      const qToDelete = state.questions.find(q => q.id === id);
      const globalIndexToDelete = state.questions.findIndex(q => q.id === id);
      
      // Calculate what to select based on the current round's visual list
      const roundQuestions = getRoundQuestions(state.questions, state.activeRound);
      const indexInRound = roundQuestions.findIndex(q => q.id === id);
      const remainingInRound = roundQuestions.filter(q => q.id !== id);
      
      const remainingGlobal = state.questions.filter(q => q.id !== id);
      
      let newActiveId = state.activeQuestionId;
      if (state.activeQuestionId === id) {
        if (remainingInRound.length === 0) {
          newActiveId = null;
        } else {
          const newIndex = Math.max(0, indexInRound - 1);
          newActiveId = remainingInRound[newIndex]?.id || remainingInRound[0]?.id;
        }
      }

      return {
        questions: remainingGlobal,
        activeQuestionId: newActiveId,
        deletedQuestions: [...state.deletedQuestions, { question: qToDelete, index: globalIndexToDelete }]
      };
    });
  },

  undoDelete: () => {
    set((state) => {
      if (state.deletedQuestions.length === 0) return {};
      const lastDeleted = state.deletedQuestions[state.deletedQuestions.length - 1];
      const newQuestions = [...state.questions];
      newQuestions.splice(lastDeleted.index, 0, lastDeleted.question);
      return {
        questions: newQuestions,
        deletedQuestions: state.deletedQuestions.slice(0, -1),
        activeQuestionId: lastDeleted.question.id
      };
    });
  },

  handleSaveQuiz: async (quizId, userId, router, showToast) => {
    const state = get();
    if (state.isSaving) return; // Prevent double-clicking race condition

    if (state.quizTitle.length > QUIZ_TITLE_MAX_LENGTH) {
      if (showToast) {
        showToast(`Quiz title must be ${QUIZ_TITLE_MAX_LENGTH} characters or less`, 'error');
      }
      return;
    }

    const validationError = validateQuizForSave({
      quizTitle: state.quizTitle,
      questions: state.questions,
    });
    if (validationError) {
      if (showToast) showToast(validationError, 'error');
      return;
    }

    if (!localStorage.getItem('zinko_jwt')) {
      if (showToast) showToast('Please sign in again to save your quiz.', 'error');
      return;
    }

    try {
      set({ isSaving: true });
      const endpoint = quizId ? `/api/quizzes/${quizId}` : '/api/quizzes';
      const apiCall = quizId ? api.put : api.post;
      const formattedQuestions = state.questions.map(formatQuestionForSave);

      await apiCall(endpoint, {
        title: state.quizTitle,
        questions: formattedQuestions,
        cover_image: state.coverImage
      });

      if (showToast) showToast(quizId ? 'Quiz updated!' : 'Quiz saved!', 'success');

      useDashboardQuizStore.getState().invalidate();
      
      if (router) {
        router.push('/dashboard');
        // Keep button disabled during Next.js route transition to prevent double clicks
        setTimeout(() => {
          set({ isSaving: false });
        }, 3000);
      } else {
        set({ isSaving: false });
      }
    } catch (error) {
      const message = error?.message || 'Failed to save quiz';
      if (showToast) showToast(message, 'error');
      set({ isSaving: false });
    }
  },

  handleGenerateQuiz: async (file, prompt, numQuestions, showToast) => {
    const state = get();
    const activeRound = state.activeRound;
    const difficulty = activeRound === 1 ? 'Easy' : activeRound === 2 ? 'Medium' : 'Hard';
    const enhancedPrompt = `[Round ${activeRound} - ${difficulty} Difficulty] ${prompt}`;

    const existingQuestionsInRound = getRoundQuestions(state.questions, activeRound)
      .map((q, idx) => {
        const type = q.questionType || QUESTION_TYPES.MULTIPLE_CHOICE;
        let line = `Q${idx + 1} [${type}]: ${q.text}`;

        if (type === QUESTION_TYPES.LINE_MATCHING) {
          const pairSummary = answersToPairs(q.answers || [])
            .map((pair) => `${pair.leftText} ↔ ${pair.rightText}`)
            .filter((entry) => entry !== ' ↔ ')
            .join('; ');
          if (pairSummary) line += ` | pairs: ${pairSummary}`;
        } else if (type === QUESTION_TYPES.DRAG_LAYERS) {
          const steps = getCorrectLayerOrder(q.answers || []).join(' → ');
          if (steps) line += ` | steps: ${steps}`;
        }

        return line;
      });

    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('prompt', enhancedPrompt);
    formData.append('numQuestions', numQuestions || 8);
    formData.append('context', JSON.stringify(existingQuestionsInRound));

    try {
      const data = await api.postForm('/api/ai/generate-quiz', formData);

      const newFormattedQuestions = formatAiQuestions(data.questions, activeRound);

      set((state) => {
        const otherRounds = state.questions.filter(
          (q) => normalizeRound(q.round) !== normalizeRound(activeRound)
        );
        const updatedQuestions = [...otherRounds, ...newFormattedQuestions];
        const newActiveId = newFormattedQuestions.length > 0 ? newFormattedQuestions[0].id : state.activeQuestionId;
        
        return {
          questions: updatedQuestions,
          activeQuestionId: newActiveId
        };
      });

      if (showToast) showToast(`Generated ${newFormattedQuestions.length} questions!`, 'success');
    } catch (error) {
      if (showToast) showToast('AI Generation failed', 'error');
      throw error;
    }
  }
}));
