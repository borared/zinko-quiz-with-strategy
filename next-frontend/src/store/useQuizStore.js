import { create } from 'zustand';
import api from '../services/api';

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
  setActiveRound: (round) => set({ activeRound: round }),
  setQuizTitle: (title) => set({ quizTitle: title }),
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

      const formattedQuestions = data.questions.map(q => ({
        id: q.id,
        text: q.question_text,
        answers: (q.answers || []).map(ans => ({
          ...ans,
          checked: !!ans.isCorrect
        })),
        image: q.image_url,
        round: q.round || 1
      }));

      set({ questions: formattedQuestions });
      if (formattedQuestions.length > 0) {
        set({ activeQuestionId: formattedQuestions[0].id });
      }
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
      round: state.activeRound,
      answers: [
        { id: 'A', text: '', color: 'bg-[#5D3FD3]', checked: true },
        { id: 'B', text: '', color: 'bg-[#FF6B4A]', checked: false },
        { id: 'C', text: '', color: 'bg-[#FF4B4B]', checked: false },
        { id: 'D', text: '', color: 'bg-[#2D3436]', checked: false },
      ],
      image: null
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

  deleteQuestion: (id) => {
    set((state) => {
      const qToDelete = state.questions.find(q => q.id === id);
      const globalIndexToDelete = state.questions.findIndex(q => q.id === id);
      
      // Calculate what to select based on the current round's visual list
      const roundQuestions = state.questions.filter(q => q.round === state.activeRound);
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

    if (!state.quizTitle.trim()) {
      if (showToast) showToast('Please enter a quiz title', 'error');
      return;
    }

    if (state.questions.length === 0) {
      if (showToast) showToast('A quiz must have at least one question to save', 'error');
      return;
    }

    try {
      set({ isSaving: true });
      const endpoint = quizId ? `/api/quizzes/${quizId}` : '/api/quizzes';
      const apiCall = quizId ? api.put : api.post;

      const formattedQuestions = state.questions.map(q => ({
        id: typeof q.id === 'string' ? q.id : undefined,
        question_text: q.text || 'Untitled Question',
        image_url: q.image || null,
        round: q.round || 1,
        time_limit: q.time_limit || 20,
        answers: q.answers.map(a => ({
          id: String(a.id),
          text: a.text || '',
          isCorrect: a.checked !== undefined ? a.checked : !!a.isCorrect,
          color: a.color || 'bg-[#5D3FD3]'
        }))
      }));

      await apiCall(endpoint, {
        title: state.quizTitle,
        creator_id: userId,
        questions: formattedQuestions,
        cover_image: state.coverImage
      });

      if (showToast) showToast(quizId ? 'Quiz updated!' : 'Quiz saved!', 'success');
      
      if (router) {
        router.push('/dashboard');
        // Keep button disabled during Next.js route transition to prevent double clicks
        setTimeout(() => {
          set({ isSaving: false });
        }, 3000);
      } else {
        set({ isSaving: false });
      }
    } catch {
      if (showToast) showToast('Failed to save quiz', 'error');
      set({ isSaving: false });
    }
  },

  handleGenerateQuiz: async (file, prompt, numQuestions, showToast) => {
    const state = get();
    const activeRound = state.activeRound;
    const difficulty = activeRound === 1 ? 'Easy' : activeRound === 2 ? 'Medium' : 'Hard';
    const enhancedPrompt = `[Round ${activeRound} - ${difficulty} Difficulty] ${prompt}`;

    const existingQuestionsInRound = state.questions
      .filter(q => q.round === activeRound)
      .map((q, idx) => `Q${idx + 1}: ${q.text}`);

    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('prompt', enhancedPrompt);
    formData.append('numQuestions', numQuestions || 8);
    formData.append('context', JSON.stringify(existingQuestionsInRound));

    try {
      const data = await api.postForm('/api/ai/generate-quiz', formData);

      const newFormattedQuestions = data.questions.map((q, index) => {
        const correctIndex = q.correctAnswerIndex !== undefined ? parseInt(q.correctAnswerIndex, 10) : 0;
        const aiChoices = q.choices || [];
        
        // Ensure we always have exactly 4 answers
        const filledAnswers = Array.from({ length: 4 }).map((_, i) => ({
          id: String.fromCharCode(65 + i),
          text: aiChoices[i] || '',
          color: i === 0 ? 'bg-[#5D3FD3]' : i === 1 ? 'bg-[#FF6B4A]' : i === 2 ? 'bg-[#FF4B4B]' : 'bg-[#2D3436]',
          checked: i === correctIndex
        }));

        return {
          id: Date.now() + index,
          text: q.question,
          answers: filledAnswers,
          image: null,
          round: activeRound
        };
      });

      set((state) => {
        const otherRounds = state.questions.filter(q => q.round !== activeRound);
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
