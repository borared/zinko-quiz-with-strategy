"use client";
import React, { useState } from 'react';
import { Pencil, Play, Loader2, Copy, Globe, Lock, Trash2, Eye, Image, CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import api from '../../services/api';
import { useDashboardQuizStore } from '@/store/useDashboardQuizStore';
import { useDiscoveryQuizStore } from '@/store/useDiscoveryQuizStore';
import { useToastStore } from '@/store/useToastStore';
import { formatDiscoveryCreatorName } from '@/lib/creatorDisplay';

import { z } from 'zod';

const hostValidationSchema = z.array(
  z.object({
    question_text: z.string()
      .min(1, "A question is missing text")
      .refine(val => val.trim() !== '' && val !== 'Untitled Question', { message: "Please fill in all question titles" }),
    answers: z.array(
      z.object({
        text: z.string()
      })
    ).refine(arr => arr.filter(a => a.text.trim() !== '').length >= 2, { message: "Each question needs at least 2 answers" })
  })
);

const QuizCard = ({ quiz, isDiscoveryMode }) => {
  const router = useRouter();
  const removeQuiz = useDashboardQuizStore((s) => s.removeQuiz);
  const invalidateDashboardCache = useDashboardQuizStore((s) => s.invalidate);
  const markQuizCloned = useDiscoveryQuizStore((s) => s.markQuizCloned);
  const { showToast } = useToastStore();
  const { user } = useUser();

  const isOwnQuiz = Boolean(
    isDiscoveryMode
    && user?.id
    && (quiz.creator_id === user.id || quiz.creator?.clerk_id === user.id || quiz.is_mine)
  );
  const alreadyCloned = Boolean(quiz.already_cloned);
  const [showError, setShowError] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [isHosting, setIsHosting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isPublicLocal, setIsPublicLocal] = useState(quiz.is_public);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const questions = quiz.questions || [];
  const r1Count = questions.filter(q => q.round === 1 || q.round === "1").length;
  const r2Count = questions.filter(q => q.round === 2 || q.round === "2").length;
  const r3Count = questions.filter(q => q.round === 3 || q.round === "3").length;
  const isReady = r1Count >= 5 && r2Count >= 5 && r3Count >= 5;

  const handleHostClick = async () => {
    if (!isReady) {
      setErrorMessage("Please add at least 5 questions per round!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const validationResult = hostValidationSchema.safeParse(questions);
    if (!validationResult.success) {
      const errorMessage = validationResult.error?.issues?.[0]?.message 
        || validationResult.error?.errors?.[0]?.message 
        || "Please check that all questions and answers are filled.";
      setErrorMessage(errorMessage);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    try {
      setIsHosting(true);
      const { pin } = await api.post('/api/game/host', { quizId: quiz.id });
      sessionStorage.setItem(`game_${pin}_quizId`, quiz.id);
      router.push(`/host/lobby/${pin}`);
    } catch (err) {
      console.error("Hosting failed:", err);
      setErrorMessage(err.message || "Failed to host game!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsHosting(false);
    }
  };

  const showAlreadyClonedToast = () => {
    showToast('You already cloned this quiz.', 'orange');
  };

  const handleCloneClick = async () => {
    if (!user) {
      setErrorMessage("Please sign in to clone quizzes!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    if (isOwnQuiz) return;
    if (alreadyCloned) {
      showAlreadyClonedToast();
      return;
    }

    try {
      setIsCloning(true);
      await api.post(`/api/quizzes/${quiz.id}/clone`, {});
      markQuizCloned(quiz.id);
      invalidateDashboardCache();
      router.push('/dashboard');
    } catch (err) {
      console.error("Cloning failed:", err);
      if (err.message?.toLowerCase().includes('already cloned')) {
        markQuizCloned(quiz.id);
        showAlreadyClonedToast();
        return;
      }
      setErrorMessage(err.message || "Failed to clone quiz!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsCloning(false);
    }
  };

  const handleTogglePublic = async () => {
    try {
      setIsUpdating(true);
      await api.patch(`/api/quizzes/${quiz.id}/visibility`, { is_public: !isPublicLocal });
      setIsPublicLocal(!isPublicLocal);
      setShowPublicModal(false);
    } catch (err) {
      console.error("Toggle failed:", err);
      setErrorMessage("Failed to update visibility!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsUpdating(true);
      await api.delete(`/api/quizzes/${quiz.id}`);
      if (!isDiscoveryMode) removeQuiz(quiz.id);
      setShowDeleteModal(false);
      setIsDeleted(true);
    } catch (err) {
      console.error("Delete failed:", err);
      setErrorMessage("Failed to delete quiz!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isDeleted) return null;

  return (
    <>
      <div className="zk-panel !shadow-none flex flex-col h-[320px] overflow-hidden relative group hover:-translate-y-0.5 transition-transform">
        
        {/* Toggle Public Button */}
        {!isDiscoveryMode && (
          <div className="absolute top-2 right-2 z-20">
            <button
              onClick={() => {
                if (quiz.is_cloned) {
                  setErrorMessage("Cannot publish a cloned quiz!");
                  setShowError(true);
                  setTimeout(() => setShowError(false), 3000);
                } else {
                  setShowPublicModal(true);
                }
              }}
              className={`p-2 rounded-full border-[2px] border-zk-black shadow-none ${isPublicLocal ? 'bg-zk-green text-zk-black' : 'bg-white text-zk-black'} ${quiz.is_cloned ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isPublicLocal ? <Globe size={16} /> : <Lock size={16} />}
            </button>
          </div>
        )}

        {/* Image Area */}
        <div className="h-32 border-b-[3px] border-zk-black bg-zk-yellow/30 overflow-hidden relative">
          {quiz.cover_image ? (
            <img src={quiz.cover_image} alt={quiz.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-zk-black/30">
              <div className="w-10 h-10 border-[2px] border-dashed border-zk-black/20 rounded-lg flex items-center justify-center">
                <Image size={18} className="opacity-40" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">No cover</span>
            </div>
          )}
          {isDiscoveryMode && isOwnQuiz && (
            <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider bg-zk-blue text-white px-2 py-0.5 border-[1.5px] border-zk-black rounded !shadow-none">
              Yours
            </span>
          )}
          {!isDiscoveryMode && isReady && (
            <span className="absolute bottom-2 left-2 text-[9px] font-black uppercase tracking-wider bg-zk-green text-zk-black px-2 py-0.5 border-[1.5px] border-zk-black rounded !shadow-none">
              Ready to host
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-1">
            {/* Question Count Tags */}
            <div className="flex flex-wrap gap-1.5">
              <div className="bg-zk-purple text-white text-[10px] font-bold px-2 py-0.5 border-[1.5px] border-zk-black rounded uppercase">
                {questions.length} Qs
              </div>
              <div className="bg-white text-zk-black text-[10px] font-bold px-2 py-0.5 border-[1.5px] border-zk-black rounded uppercase">
                R1:{r1Count} R2:{r2Count} R3:{r3Count}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-black text-lg text-zk-black mt-1 leading-tight line-clamp-2">{quiz.title}</h3>

            {/* Subtitle */}
            <p className="text-xs text-gray-500 font-bold">
              0 Plays • Created {timeAgo(quiz.created_at)}
            </p>
            {isDiscoveryMode && quiz.creator && (
              <p className="text-xs text-zk-blue font-bold">
                By {formatDiscoveryCreatorName(quiz.creator)}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-2 relative">
            <AnimatePresence>
              {showError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: -55, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute left-0 right-0 bg-[#FF4B4B] text-white px-4 py-3 text-[10px] font-black rounded-xl !shadow-none border-[3px] border-zk-black z-[50] flex items-center justify-center text-center uppercase"
                >
                  {errorMessage}
                  <div className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FF4B4B] border-r-[3px] border-b-[3px] border-zk-black rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>

            {isDiscoveryMode ? (
              <>
                <button
                  onClick={() => setShowDetailsModal(true)}
                  className="flex-1 bg-white text-zk-black border-[2px] border-zk-black !shadow-none py-2 font-['Amatic_SC'] font-bold text-2xl rounded-lg transition-colors hover:bg-zk-yellow/30 flex items-center justify-center gap-1.5 leading-none pt-2"
                >
                  <Eye size={14} /> View
                </button>
                {!isOwnQuiz && (
                  alreadyCloned ? (
                    <button
                      type="button"
                      onClick={showAlreadyClonedToast}
                      className="flex-1 bg-zk-green/25 text-zk-black border-[2px] border-zk-black !shadow-none py-2 font-['Amatic_SC'] font-bold text-2xl rounded-lg transition-colors hover:bg-zk-green/35 flex items-center justify-center gap-1.5 leading-none pt-2"
                    >
                      <CheckCheck size={14} /> Cloned
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCloneClick}
                      disabled={isCloning}
                      className="flex-1 bg-[#5D3FD3] text-white border-[2px] border-zk-black !shadow-none py-2 font-['Amatic_SC'] font-bold text-2xl rounded-lg transition-colors hover:bg-[#4e33b8] flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-wait leading-none pt-2"
                    >
                      {isCloning ? (
                        <><Loader2 size={14} className="animate-spin" /> Cloning...</>
                      ) : (
                        <><Copy size={14} /> Clone</>
                      )}
                    </button>
                  )
                )}
              </>
            ) : (
              <>
                <button
                  id={`host-btn-${quiz.id}`}
                  onClick={handleHostClick}
                  disabled={isHosting}
                  className="flex-1 bg-zk-purple text-white border-[2px] border-zk-black !shadow-none py-2 font-['Amatic_SC'] font-bold text-2xl rounded-lg transition-colors hover:bg-zk-purple-light flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-wait leading-none pt-2"
                >
                  {isHosting ? (
                    <><Loader2 size={16} className="animate-spin" /> Creating...</>
                  ) : (
                    <><Play size={16} fill="currentColor" /> Host</>
                  )}
                </button>
                <button
                  onClick={() => router.push('/create-game/' + quiz.id)}
                  className="bg-white text-zk-black border-[2px] border-zk-black !shadow-none p-2 font-bold text-sm flex items-center justify-center rounded-lg transition-colors hover:bg-zk-yellow/30"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-[#FF4B4B] text-white border-[2px] border-zk-black !shadow-none p-2 font-bold text-sm flex items-center justify-center rounded-lg transition-colors hover:bg-[#e63e3e]"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-16 bg-zk-white border-[4px] border-zk-black !shadow-none p-6 max-w-2xl w-full flex flex-col rounded-xl max-h-[80vh] overflow-hidden sm:mt-20">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-3xl font-black text-zk-black uppercase leading-none">{quiz.title}</h3>
                <p className="text-zk-black/70 font-bold mt-1 text-sm">
                  By {formatDiscoveryCreatorName(quiz.creator)} • {questions.length} Questions
                </p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="bg-[#FF4B4B] text-white border-[2px] border-zk-black w-8 h-8 flex items-center justify-center font-black rounded-lg transition-colors hover:bg-[#e63e3e]">
                X
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
              {questions.map((q, i) => (
                <div key={q.id || i} className="bg-white border-[2px] border-zk-black rounded-lg p-3 !shadow-none">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-sm uppercase bg-zk-yellow px-2 py-0.5 border-[1.5px] border-zk-black rounded">Q{i + 1} (R{q.round})</span>
                  </div>
                  <p className="font-bold text-zk-black mb-2">{q.question_text}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {q.answers?.map((a, j) => (
                      <div key={j} className={`border-[1.5px] border-zk-black rounded p-1.5 font-bold ${a.is_correct ? 'bg-green-400 text-zk-black' : 'bg-gray-100 text-gray-500'}`}>
                        {a.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-center font-bold text-zk-black/50 py-8">No questions found.</p>
              )}
            </div>
            
            {!isOwnQuiz && (
              <div className="mt-4 pt-4 border-t-[3px] border-zk-black flex justify-end">
                {alreadyCloned ? (
                  <button
                    type="button"
                    onClick={showAlreadyClonedToast}
                    className="bg-zk-green/25 text-zk-black border-[2px] border-zk-black px-8 py-2 font-['Amatic_SC'] font-bold text-2xl !shadow-none rounded-lg transition-colors hover:bg-zk-green/35 flex items-center justify-center gap-1.5 leading-none pt-2"
                  >
                    <CheckCheck size={16} /> Cloned
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setShowDetailsModal(false); handleCloneClick(); }}
                    disabled={isCloning}
                    className="bg-[#5D3FD3] text-white border-[2px] border-zk-black px-8 py-2 font-['Amatic_SC'] font-bold text-2xl !shadow-none rounded-lg transition-colors hover:bg-[#4e33b8] flex items-center justify-center gap-1.5 leading-none pt-2 disabled:opacity-60"
                  >
                    {isCloning ? <><Loader2 size={16} className="animate-spin" /> Cloning...</> : <><Copy size={16} /> Clone Quiz</>}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {showPublicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zk-white border-[4px] border-zk-black !shadow-none p-6 max-w-sm w-full flex flex-col items-center rounded-xl">
            <h3 className="font-['Outfit'] text-xl font-black mb-2 text-zk-black uppercase text-center">
              {isPublicLocal ? "Make Private?" : "Make Public?"}
            </h3>
            <p className="text-zk-black/70 mb-6 text-center font-bold text-sm">
              {isPublicLocal ? "This quiz will no longer be visible in the Discovery section." : "This quiz will be visible to everyone in the Discovery section!"}
            </p>
            <div className="flex gap-4 w-full">
              <button onClick={() => setShowPublicModal(false)} disabled={isUpdating} className="flex-1 bg-gray-200 text-zk-black border-[3px] border-zk-black !shadow-none py-2 font-['Amatic_SC'] text-2xl font-black transition-colors hover:bg-zk-yellow/30 rounded-lg leading-none pt-2 disabled:opacity-60">NO</button>
              <button onClick={handleTogglePublic} disabled={isUpdating} className="flex-1 bg-green-400 text-zk-black border-[3px] border-zk-black !shadow-none py-2 font-['Amatic_SC'] text-2xl font-black transition-colors hover:bg-green-300 rounded-lg flex justify-center items-center leading-none pt-2 disabled:opacity-60">
                {isUpdating ? <Loader2 size={20} className="animate-spin" /> : "YES"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zk-white border-[4px] border-zk-black !shadow-none p-6 max-w-sm w-full flex flex-col items-center rounded-xl">
            <h3 className="font-['Outfit'] text-2xl font-black uppercase tracking-tight mb-2 text-zk-black text-center">Delete Quiz?</h3>
            <p className="text-zk-black/70 mb-6 text-center font-bold text-sm">Are you sure you want to delete this quiz? This cannot be undone.</p>
            <div className="flex gap-4 w-full">
              <button onClick={() => setShowDeleteModal(false)} disabled={isUpdating} className="flex-1 bg-gray-200 text-zk-black border-[3px] border-zk-black !shadow-none py-2 font-['Amatic_SC'] text-2xl font-black rounded-lg leading-none pt-2 transition-colors hover:bg-zk-yellow/30 disabled:opacity-60">NO</button>
              <button onClick={handleDelete} disabled={isUpdating} className="flex-1 bg-[#FF4B4B] text-white border-[3px] border-zk-black !shadow-none py-2 font-['Amatic_SC'] text-2xl font-black rounded-lg flex justify-center items-center leading-none pt-2 transition-colors hover:bg-[#e63e3e] disabled:opacity-60">
                {isUpdating ? <Loader2 size={20} className="animate-spin" /> : "DELETE"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default QuizCard;
