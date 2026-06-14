"use client";
import React, { useState } from 'react';
import { Pencil, Play, Loader2, Copy, Globe, Lock, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import api from '../../services/api';

const QuizCard = ({ quiz, isDiscoveryMode }) => {
  const router = useRouter();
  const { user } = useUser();
  const [showError, setShowError] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [isHosting, setIsHosting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
  const isReady = r1Count >= 6 && r2Count >= 6 && r3Count >= 6;

  const handleHostClick = async () => {
    if (!isReady) {
      setErrorMessage("Please add at least 6 questions per round!");
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

  const handleCloneClick = async () => {
    if (!user) {
      setErrorMessage("Please sign in to clone quizzes!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    try {
      setIsCloning(true);
      await api.post(`/api/quizzes/${quiz.id}/clone`, { newCreatorId: user.id });
      router.push('/dashboard');
    } catch (err) {
      console.error("Cloning failed:", err);
      setErrorMessage("Failed to clone quiz!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsCloning(false);
    }
  };

  const handleTogglePublic = async () => {
    try {
      setIsUpdating(true);
      await api.patch(`/api/quizzes/${quiz.id}/visibility`, { is_public: !quiz.is_public });
      setShowPublicModal(false);
      window.location.reload();
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
      setShowDeleteModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Delete failed:", err);
      setErrorMessage("Failed to delete quiz!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="bg-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[320px] rounded-xl overflow-hidden relative">
        
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
              className={`p-2 rounded-full border-[2px] border-zk-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all ${quiz.is_public ? 'bg-green-400 text-zk-black' : 'bg-gray-200 text-gray-500'} ${quiz.is_cloned ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {quiz.is_public ? <Globe size={16} /> : <Lock size={16} />}
            </button>
          </div>
        )}

        {/* Image Area */}
        <div className="h-32 border-b-[3px] border-zk-black bg-[#E0E0E0] overflow-hidden">
          {quiz.cover_image ? (
            <img src={quiz.cover_image} alt={quiz.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zk-black/30 font-bold">
              No Image
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-1">
            {/* Question Count Tags */}
            <div className="flex gap-2">
              <div className={`bg-[#5D3FD3] text-white text-[10px] font-bold px-2 py-0.5 border-[1.5px] border-zk-black rounded-lg uppercase`}>
                {questions.length} Questions
              </div>
              <div className={`bg-white text-zk-black text-[10px] font-bold px-2 py-0.5 border-[1.5px] border-zk-black rounded-lg uppercase`}>
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
                By {[quiz.creator.first_name, quiz.creator.last_name].filter(Boolean).join(' ') || quiz.creator.username || 'Unknown'}
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
                  className="absolute left-0 right-0 bg-[#FF4B4B] text-white px-4 py-3 text-[10px] font-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] border-zk-black z-[50] flex items-center justify-center text-center uppercase"
                >
                  {errorMessage}
                  <div className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FF4B4B] border-r-[3px] border-b-[3px] border-zk-black rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>

            {isDiscoveryMode ? (
              <button
                onClick={handleCloneClick}
                disabled={isCloning}
                className="flex-1 bg-[#5D3FD3] text-white border-[2px] border-zk-black py-2 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-wait"
              >
                {isCloning ? (
                  <><Loader2 size={14} className="animate-spin" /> Cloning...</>
                ) : (
                  <><Copy size={14} /> Clone</>
                )}
              </button>
            ) : (
              <>
                <button
                  id={`host-btn-${quiz.id}`}
                  onClick={handleHostClick}
                  disabled={isHosting}
                  className="flex-1 bg-[#5D3FD3] text-white border-[2px] border-zk-black py-2 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-wait"
                >
                  {isHosting ? (
                    <><Loader2 size={14} className="animate-spin" /> Creating...</>
                  ) : (
                    <><Play size={14} fill="currentColor" /> Host</>
                  )}
                </button>
                <button
                  onClick={() => router.push('/create-game/' + quiz.id)}
                  className="bg-white text-zk-black border-[2px] border-zk-black p-2 font-bold text-sm flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none rounded-lg"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-[#FF4B4B] text-white border-[2px] border-zk-black p-2 font-bold text-sm flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPublicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zk-white border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-sm w-full flex flex-col items-center rounded-xl">
            <h3 className="text-xl font-black mb-2 text-zk-black uppercase text-center">
              {quiz.is_public ? "Make Private?" : "Make Public?"}
            </h3>
            <p className="text-zk-black/70 mb-6 text-center font-bold text-sm">
              {quiz.is_public ? "This quiz will no longer be visible in the Discovery section." : "This quiz will be visible to everyone in the Discovery section!"}
            </p>
            <div className="flex gap-4 w-full">
              <button onClick={() => setShowPublicModal(false)} disabled={isUpdating} className="flex-1 bg-gray-200 text-zk-black border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-2 font-black transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg">NO</button>
              <button onClick={handleTogglePublic} disabled={isUpdating} className="flex-1 bg-green-400 text-zk-black border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-2 font-black transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg flex justify-center items-center">
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : "YES"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zk-white border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-sm w-full flex flex-col items-center rounded-xl">
            <h3 className="text-xl font-black mb-2 text-zk-black uppercase text-center">Delete Quiz?</h3>
            <p className="text-zk-black/70 mb-6 text-center font-bold text-sm">Are you sure you want to delete this quiz? This cannot be undone.</p>
            <div className="flex gap-4 w-full">
              <button onClick={() => setShowDeleteModal(false)} disabled={isUpdating} className="flex-1 bg-gray-200 text-zk-black border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-2 font-black transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg">NO</button>
              <button onClick={handleDelete} disabled={isUpdating} className="flex-1 bg-[#FF4B4B] text-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-2 font-black transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg flex justify-center items-center">
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : "DELETE"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default QuizCard;
