"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Sidebar from '../../components/GameCreator/Sidebar';
import QuestionEditor from '../../components/GameCreator/QuestionEditor';
import AnswerGrid from '../../components/GameCreator/AnswerGrid';
import AiSidebar from '../../components/GameCreator/AiSidebar';
import { Wand2, Image, Upload, Link as LinkIcon, X } from 'lucide-react';
import { useQuizStore, QUIZ_TITLE_MAX_LENGTH } from '@/store/useQuizStore';
import { useToastStore } from '@/store/useToastStore';

const SUBNAV_H = 92;
const SIDEBAR_W = 320;

const QUIZ_TITLE_PLACEHOLDER = `Name your quiz (max ${QUIZ_TITLE_MAX_LENGTH} chars)`;
const QUIZ_TITLE_INPUT_CLASS =
  "bg-transparent border-0 border-b-[3px] border-b-zk-blue font-['Outfit'] font-bold text-zk-black focus:outline-none transition-colors placeholder:font-medium placeholder:italic placeholder:text-zk-black/40 placeholder:normal-case";

const CreatorSkeleton = () => (
  <div className="min-h-[calc(100vh-76px)] font-sans relative">
    <div className="fixed inset-0 top-[76px] z-0" aria-hidden="true">
      <div className="absolute inset-0 zk-workspace-bg-creator" />
      <div className="absolute inset-0 bg-gradient-to-b from-zk-black/35 via-zk-black/10 to-zk-black/50" />
    </div>
    <div className="relative z-10">
      <div
        className="fixed top-[76px] left-0 right-0 z-50 zk-panel border-t-0 border-x-0 rounded-none flex items-center px-6 gap-4"
        style={{ height: SUBNAV_H }}
        style={{ paddingLeft: SIDEBAR_W + 24 }}
      >
        <div className="h-8 w-40 zk-skeleton rounded-lg" />
        <div className="h-8 w-56 zk-skeleton rounded-lg" />
        <div className="ml-auto h-10 w-28 zk-skeleton rounded-lg" />
      </div>
      <aside
        className="hidden lg:block fixed top-[76px] left-0 z-40"
        style={{ width: SIDEBAR_W, height: 'calc(100vh - 76px)' }}
      >
        <div className="h-full zk-panel border-t-0 border-l-0 rounded-none flex flex-col">
          <div className="h-16 border-b-[3px] border-zk-black px-6 flex items-center">
            <div className="h-4 w-32 zk-skeleton rounded" />
          </div>
          <div className="flex-1 p-4 flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 zk-skeleton rounded-lg border-[3px] border-zk-black/20" />
            ))}
          </div>
        </div>
      </aside>
      <main className="p-6 lg:p-8" style={{ paddingTop: SUBNAV_H + 24, marginLeft: 0 }}>
        <div className="lg:ml-80 max-w-[1200px] mx-auto flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 zk-skeleton rounded-xl border-[3px] border-zk-black/20" />
            ))}
          </div>
          <div className="h-64 zk-skeleton rounded-xl border-[3px] border-zk-black/20" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 zk-skeleton rounded-xl border-[3px] border-zk-black/20" />
            ))}
          </div>
        </div>
      </main>
    </div>
  </div>
);

const GameCreatorContent = () => {
  const router = useRouter();
  const { quizId } = useParams();
  const { user } = useUser();
  const { showToast } = useToastStore();

  const {
    quizTitle,
    setQuizTitle,
    coverImage,
    setCoverImage,
    activeRound,
    setActiveRound,
    questions,
    handleSaveQuiz,
    fetchQuiz,
    isSaving,
    loading,
    undoDelete,
    activeQuestionId,
    resetQuiz,
    handleAddQuestion,
    setActiveQuestionId,
  } = useQuizStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        const activeEl = document.activeElement;
        const isInput =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.isContentEditable);

        if (!isInput) {
          e.preventDefault();
          undoDelete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoDelete]);

  useEffect(() => {
    if (quizId) {
      fetchQuiz(quizId, showToast);
    } else {
      resetQuiz();
    }
  }, [quizId, fetchQuiz, showToast, resetQuiz]);

  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const onSave = () => {
    handleSaveQuiz(quizId, user?.id, router, showToast);
  };

  const roundQuestions = questions.filter((q) => q.round === activeRound);

  const rounds = [
    { id: 1, label: 'Round 1', difficulty: 'Easy', color: 'bg-zk-green' },
    { id: 2, label: 'Round 2', difficulty: 'Medium', color: 'bg-zk-cream' },
    { id: 3, label: 'Round 3', difficulty: 'Hard', color: 'bg-zk-coral' },
  ];

  if (loading) {
    return <CreatorSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-76px)] font-sans relative">
      <div className="fixed inset-0 top-[76px] z-0" aria-hidden="true">
        <div className="absolute inset-0 zk-workspace-bg-creator" />
        <div className="absolute inset-0 bg-gradient-to-b from-zk-black/35 via-zk-black/10 to-zk-black/50" />
      </div>

      <div className="relative z-10">
        {/* Sub-navigation bar */}
        <nav
          className="fixed top-[76px] left-0 lg:left-80 right-0 z-50 zk-panel border-t-0 border-x-0 rounded-none flex flex-col justify-center px-4 lg:px-6 box-border"
          style={{ height: SUBNAV_H }}
        >
          <div className="flex items-center justify-between gap-4 w-full pt-1">
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder={QUIZ_TITLE_PLACEHOLDER}
              maxLength={QUIZ_TITLE_MAX_LENGTH}
              aria-label={`Quiz title, maximum ${QUIZ_TITLE_MAX_LENGTH} characters`}
              className={`${QUIZ_TITLE_INPUT_CLASS} flex-1 min-w-0 max-w-[520px] lg:max-w-[640px] text-lg lg:text-xl px-1 py-1.5 leading-normal`}
            />

            <div className="flex items-center gap-2 shrink-0 translate-y-1.5">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 font-bold text-sm rounded-lg border-[3px] border-zk-black shadow-none ${
                  coverImage ? 'bg-zk-blue text-white' : 'bg-white text-zk-black'
                }`}
              >
                <Image size={16} />
                <span className="hidden sm:inline">{coverImage ? 'Cover' : 'Add Cover'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAiSidebarOpen(true)}
                className="lg:hidden zk-btn-press bg-zk-purple text-white p-2 rounded-lg"
                aria-label="Open AI assistant"
              >
                <Wand2 size={18} strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="bg-zk-green text-white px-4 lg:px-6 py-2 font-black text-sm uppercase tracking-wider rounded-lg border-[3px] border-zk-black shadow-none disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </nav>

        {/* Desktop sidebar */}
        <aside
          className="hidden lg:block fixed top-[76px] left-0 z-40"
          style={{ width: SIDEBAR_W, height: 'calc(100vh - 76px)' }}
        >
          <Sidebar />
        </aside>

        <main
          className="px-4 lg:px-8 pb-32"
          style={{ paddingTop: SUBNAV_H + 16 }}
        >
          <div className="lg:ml-80 flex gap-6 lg:gap-8 items-start max-w-[1600px] mx-auto">
            <div className="flex-1 min-w-0 flex flex-col gap-6 lg:gap-8">
              {/* Mobile question strip */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {roundQuestions.map((q, index) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveQuestionId(q.id)}
                    className={`shrink-0 px-3 py-2 border-[2px] border-zk-black rounded-lg font-bold text-xs transition-all ${
                      q.id === activeQuestionId
                        ? 'bg-zk-purple text-white shadow-[2px_2px_0_0_#000]'
                        : 'bg-white text-zk-black'
                    }`}
                  >
                    Q{index + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="shrink-0 px-3 py-2 border-[2px] border-dashed border-zk-black rounded-lg font-bold text-xs bg-zk-green text-white"
                >
                  + Add
                </button>
              </div>

              {/* Round switcher */}
              <div className="zk-panel p-3 lg:p-4 grid grid-cols-3 gap-3 lg:gap-4">
                {rounds.map((round) => {
                  const count = questions.filter((q) => q.round === round.id).length;
                  const isActive = activeRound === round.id;
                  const isComplete = count >= 6;

                  return (
                    <button
                      key={round.id}
                      type="button"
                      onClick={() => setActiveRound(round.id)}
                      className={`relative border-[3px] border-zk-black p-3 lg:p-4 transition-all rounded-xl zk-btn-press ${
                        isActive
                          ? `${round.color} text-zk-black shadow-[4px_4px_0_0_#000] -translate-y-0.5`
                          : 'bg-white text-zk-black hover:bg-zk-yellow/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-left min-w-0">
                          <p
                            className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${
                              isActive ? 'text-zk-black/60' : 'text-zk-black/50'
                            }`}
                          >
                            {round.difficulty}
                          </p>
                          <h3 className="text-sm lg:text-lg font-black uppercase leading-tight truncate">
                            {round.label}
                          </h3>
                        </div>
                        <div
                          className={`w-9 h-9 lg:w-10 lg:h-10 border-[3px] border-zk-black flex items-center justify-center font-black text-sm rounded-lg shrink-0 ${
                            isComplete
                              ? 'bg-zk-blue text-white'
                              : count > 0
                                ? 'bg-white text-zk-black'
                                : 'bg-zk-black/5 text-zk-black/40'
                          }`}
                        >
                          {count}/8
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {activeQuestionId ? (
                  <motion.div
                    key={activeQuestionId}
                    initial={{ opacity: 0, scale: 0.98, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -8 }}
                    transition={{ type: 'spring', stiffness: 700, damping: 24 }}
                    className="flex flex-col gap-6 lg:gap-8"
                  >
                    <QuestionEditor />
                    <AnswerGrid />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="zk-panel border-dashed p-10 lg:p-12 flex flex-col items-center justify-center gap-3 text-center min-h-[200px]"
                  >
                    <p className="font-['Outfit'] text-3xl font-black text-zk-black/40 tracking-tight">
                      Pick a question
                    </p>
                    <p className="font-bold text-sm text-zk-black/50">
                      Select from the list or add a new one to start editing
                    </p>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="zk-btn-press bg-zk-green text-white px-6 py-2 rounded-lg font-bold mt-2 lg:hidden"
                    >
                      + Add Question
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop AI toggle */}
            <aside className="hidden lg:block sticky top-44 shrink-0">
              <button
                type="button"
                onClick={() => setIsAiSidebarOpen(true)}
                className="zk-btn-press bg-zk-purple text-white p-4 rounded-xl flex flex-col items-center gap-2 group"
              >
                <Wand2
                  size={24}
                  strokeWidth={3}
                  className="group-hover:rotate-12 transition-transform"
                />
                <span className="font-black text-[10px] uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
                  AI
                </span>
              </button>
            </aside>
          </div>
        </main>
      </div>

      <AiSidebar isOpen={isAiSidebarOpen} onClose={() => setIsAiSidebarOpen(false)} />

      {/* Cover image modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImageModalOpen(false)}
              className="absolute inset-0 bg-zk-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="zk-panel shadow-[12px_12px_0_0_#000] w-full max-w-md relative z-10 p-6 lg:p-8"
            >
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-zk-black/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="font-['Outfit'] text-4xl font-black text-zk-black tracking-tight uppercase mb-1">Quiz Cover</h2>
              <p className="text-zk-black/60 font-bold text-sm mb-6 uppercase tracking-wide">
                Choose a visual for your game
              </p>

              <div className="flex flex-col gap-5">
                <div
                  role="button"
                  tabIndex={0}
                  className="aspect-video bg-zk-black/5 border-[3px] border-dashed border-zk-black rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zk-purple/5 transition-all group"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && document.getElementById('cover-upload')?.click()
                  }
                >
                  {coverImage ? (
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload
                        size={36}
                        className="text-zk-black/30 group-hover:text-zk-purple transition-colors"
                      />
                      <span className="font-bold text-sm uppercase tracking-wider text-zk-black/40">
                        Upload image
                      </span>
                    </>
                  )}
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setCoverImage(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <LinkIcon size={16} className="text-zk-black/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    value={
                      typeof coverImage === 'string' && coverImage.startsWith('http')
                        ? coverImage
                        : ''
                    }
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full border-[3px] border-zk-black p-3 pl-11 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-zk-purple/20 rounded-xl"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="w-full zk-btn-press bg-zk-black text-white py-3 font-black uppercase tracking-widest rounded-xl"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GameCreator = () => <GameCreatorContent />;

export default GameCreator;