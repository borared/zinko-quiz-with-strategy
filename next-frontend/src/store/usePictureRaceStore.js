import { create } from 'zustand';
import api from '../services/api';

const createEmptyQuestion = () => ({
  id: crypto.randomUUID(),
  title: '',
  answer: '',
  imageSrc: null,
  crop: { x: 0, y: 0 },
  zoom: 1,
});

export const usePictureRaceStore = create((set, get) => ({
  raceTitle: '',
  setRaceTitle: (title) => set({ raceTitle: title }),
  
  coverImage: null,
  setCoverImage: (image) => set({ coverImage: image }),
  
  questions: [createEmptyQuestion()],
  activeQuestionId: null,
  isSaving: false,
  loading: false,

  resetRace: () => set({
    raceTitle: '',
    coverImage: null,
    questions: [createEmptyQuestion()],
    activeQuestionId: null,
    isSaving: false,
    loading: false,
  }),
  
  setActiveQuestionId: (id) => set({ activeQuestionId: id }),
  
  addQuestion: () => set((state) => {
    const newQuestion = createEmptyQuestion();
    return {
      questions: [...state.questions, newQuestion],
      activeQuestionId: newQuestion.id,
    };
  }),

  deleteQuestion: (id) => set((state) => {
    const newQuestions = state.questions.filter(q => q.id !== id);
    if (newQuestions.length === 0) {
      const newQuestion = createEmptyQuestion();
      return { questions: [newQuestion], activeQuestionId: newQuestion.id };
    }
    const newActiveId = state.activeQuestionId === id ? newQuestions[0].id : state.activeQuestionId;
    return { questions: newQuestions, activeQuestionId: newActiveId };
  }),

  updateQuestion: (id, updates) => set((state) => ({
    questions: state.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
  })),

  initialize: () => set((state) => {
    if (!state.activeQuestionId && state.questions.length > 0) {
      return { activeQuestionId: state.questions[0].id };
    }
    return state;
  }),
  
  fetchRace: async (id, showToast) => {
    try {
      set({ loading: true });
      const data = await api.get(`/api/picture-races/${id}`);
      
      const formattedQuestions = data.questions.map(q => ({
        id: q.id || crypto.randomUUID(),
        title: q.question || '', // Use the distinct question field
        answer: q.answer,
        imageSrc: q.original_image || q.image_url,
        croppedImageSrc: q.image_url, // Server returns the final cropped URL as image_url
        crop: q.crop_data?.crop || { x: 0, y: 0 },
        zoom: q.crop_data?.zoom || 1,
      }));

      set({
        raceTitle: data.title,
        coverImage: data.cover_image,
        questions: formattedQuestions.length > 0 ? formattedQuestions : [createEmptyQuestion()],
        activeQuestionId: formattedQuestions.length > 0 ? formattedQuestions[0].id : null,
      });
    } catch (err) {
      console.error('Failed to fetch picture race', err);
      if (showToast) showToast('Failed to load Picture Race', 'error');
    } finally {
      set({ loading: false });
    }
  },
  
  handleSaveRace: async (raceId, router, showToast) => {
    const state = get();
    if (state.isSaving) return;

    if (!state.raceTitle || state.raceTitle.trim() === '') {
      if (showToast) showToast('Please enter a Race Title to save!', 'error');
      return;
    }

    try {
      set({ isSaving: true });
      
      const formattedQuestions = state.questions.map(q => ({
        question: q.title || '',
        original_image: q.imageSrc || '',
        image_url: q.croppedImageSrc || q.imageSrc || '',
        answer: q.answer || 'Unknown',
        crop_data: { crop: q.crop || q.savedCrop, zoom: q.zoom || q.savedZoom }
      })).filter(q => q.image_url);

      if (formattedQuestions.length === 0) {
        if (showToast) showToast('Please add at least one image to save!', 'error');
        set({ isSaving: false });
        return;
      }

      const endpoint = raceId ? `/api/picture-races/${raceId}` : '/api/picture-races';
      const apiCall = raceId ? api.put : api.post;

      const response = await apiCall(endpoint, {
        title: state.raceTitle,
        questions: formattedQuestions,
        cover_image: state.coverImage
      });

      console.log('Save response:', response);

      if (showToast) showToast('Picture Race saved successfully!', 'success');
      
      if (router) {
        router.push('/dashboard/guess_picture');
      }
      
      setTimeout(() => set({ isSaving: false }), 1000);
    } catch (err) {
      const message = err?.message || 'Failed to save Picture Race';
      if (showToast) showToast(message, 'error');
      set({ isSaving: false });
    }
  }
}));
