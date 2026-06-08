"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import api from '../services/api';
import { useToast } from './ToastContext';

const QuizContext = createContext(null);

export const QuizProvider = ({ children }) => {
  const { quizId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { showToast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [activeRound, setActiveRound] = useState(1);
  const [quizTitle, setQuizTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Fetch Quiz if Editing ──────────────────────────────────────────────────
  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/api/quizzes/${quizId}`);
        setQuizTitle(data.title);
        setCoverImage(data.cover_image);

        const formattedQuestions = data.questions.map(q => ({
          id: q.id,
          text: q.question_text,
          answers: q.answers,
          image: q.image_url,
          round: q.round || 1
        }));

        setQuestions(formattedQuestions);
        if (formattedQuestions.length > 0) {
          setActiveQuestionId(formattedQuestions[0].id);
        }
      } catch {
        showToast('Failed to load quiz data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, showToast]);

  // ── Memoized derived state ─────────────────────────────────────────────────
  const activeQuestion = useMemo(
    () => questions.find(q => q.id === activeQuestionId) || null,
    [questions, activeQuestionId]
  );

  // ── Memoized handlers (stable references — prevents child re-renders) ──────
  const handleAddQuestion = useCallback(() => {
    const newId = Date.now();
    const newQuestion = {
      id: newId,
      text: '',
      round: activeRound,
      answers: [
        { id: 'A', text: '', color: 'bg-[#5D3FD3]', checked: true },
        { id: 'B', text: '', color: 'bg-[#FF6B4A]', checked: false },
        { id: 'C', text: '', color: 'bg-[#FF4B4B]', checked: false },
        { id: 'D', text: '', color: 'bg-[#2D3436]', checked: false },
      ],
      image: null
    };
    setQuestions(prev => [...prev, newQuestion]);
    setActiveQuestionId(newId);
  }, [activeRound]);

  const updateActiveQuestion = useCallback((updates) => {
    setQuestions(prev =>
      prev.map(q => q.id === activeQuestionId ? { ...q, ...updates } : q)
    );
  }, [activeQuestionId]);

  const deleteQuestion = useCallback((id) => {
    setQuestions(prev => {
      const remaining = prev.filter(q => q.id !== id);
      if (activeQuestionId === id) {
        setActiveQuestionId(remaining[0]?.id || null);
      }
      return remaining;
    });
  }, [activeQuestionId]);

  const handleSaveQuiz = useCallback(async () => {
    if (!quizTitle.trim()) {
      showToast('Please enter a quiz title', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const endpoint = quizId ? `/api/quizzes/${quizId}` : '/api/quizzes';
      const apiCall = quizId ? api.put : api.post;

      await apiCall(endpoint, {
        title: quizTitle,
        creator_id: user?.id,
        questions,
        cover_image: coverImage
      });

      showToast(quizId ? 'Quiz updated!' : 'Quiz saved!', 'success');
      router.push('/dashboard');
    } catch {
      showToast('Failed to save quiz', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [quizTitle, quizId, questions, coverImage, user, showToast, router]);

  const handleGenerateQuiz = useCallback(async (file, prompt, numQuestions) => {
    const difficulty = activeRound === 1 ? 'Easy' : activeRound === 2 ? 'Medium' : 'Hard';
    const enhancedPrompt = `[Round ${activeRound} - ${difficulty} Difficulty] ${prompt}`;

    const existingQuestionsInRound = questions
      .filter(q => q.round === activeRound)
      .map((q, idx) => `Q${idx + 1}: ${q.text}`);

    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('prompt', enhancedPrompt);
    formData.append('numQuestions', numQuestions || 8);
    formData.append('context', JSON.stringify(existingQuestionsInRound));

    try {
      const data = await api.postForm('/api/ai/generate-quiz', formData);

      const newFormattedQuestions = data.questions.map((q, index) => ({
        id: Date.now() + index,
        text: q.question,
        answers: q.choices.map((choice, i) => ({
          id: String.fromCharCode(65 + i),
          text: choice,
          color: i === 0 ? 'bg-[#5D3FD3]' : i === 1 ? 'bg-[#FF6B4A]' : i === 2 ? 'bg-[#FF4B4B]' : 'bg-[#2D3436]',
          checked: i === q.correctAnswerIndex
        })),
        image: null,
        round: activeRound
      }));

      setQuestions(prev => {
        const otherRounds = prev.filter(q => q.round !== activeRound);
        return [...otherRounds, ...newFormattedQuestions];
      });

      if (newFormattedQuestions.length > 0) {
        setActiveQuestionId(newFormattedQuestions[0].id);
      }
        showToast(`Generated ${newFormattedQuestions.length} questions!`, 'success');
    } catch (error) {
      showToast('AI Generation failed', 'error');
      throw error;
    }
  }, [activeRound, questions, showToast]);

  // ── Memoized context value (prevents ALL consumers re-rendering on unrelated state changes)
  const value = useMemo(() => ({
    questions,
    activeQuestionId,
    activeQuestion,
    activeRound,
    quizTitle,
    coverImage,
    isSaving,
    loading,
    setActiveQuestionId,
    setActiveRound,
    setQuizTitle,
    setCoverImage,
    setQuestions,
    handleAddQuestion,
    updateActiveQuestion,
    deleteQuestion,
    handleSaveQuiz,
    handleGenerateQuiz,
  }), [
    questions, activeQuestionId, activeQuestion, activeRound,
    quizTitle, coverImage, isSaving, loading,
    handleAddQuestion, updateActiveQuestion, deleteQuestion,
    handleSaveQuiz, handleGenerateQuiz
  ]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within QuizProvider');
  return context;
};
