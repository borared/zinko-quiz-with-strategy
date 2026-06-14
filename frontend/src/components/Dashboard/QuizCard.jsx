import React, { useState } from 'react';
import { Pencil, Play, Loader2, Globe, Lock, Copy, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const QuizCard = ({ quiz, isDiscoveryMode = false, onClone, onDelete, onPreview }) => {
  const navigate = useNavigate();
  const [showError, setShowError] = React.useState(false);
  const [apiError, setApiError] = React.useState(null);
  const [isPublic, setIsPublic] = useState(quiz.is_public || false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleVisibility = async (newStatus) => {
    try {
      setIsPublic(newStatus); // Optimistic update
      await api.patch(`/api/quizzes/${quiz.id}/visibility`, { is_public: newStatus });
    } catch (err) {
      console.error('Failed to update visibility', err);
      setIsPublic(!newStatus); // revert on error
      setApiError('Failed to update visibility');
      setTimeout(() => setApiError(null), 3000);
    }
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    if (!isPublic) {
      setShowConfirmModal(true);
    } else {
      toggleVisibility(false);
    }
  };

  const handleConfirmPublic = (e) => {
    e.stopPropagation();
    setShowConfirmModal(false);
    toggleVisibility(true);
  };
  
  const handleCancelPublic = (e) => {
    e.stopPropagation();
    setShowConfirmModal(false);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(false);
    if (onDelete) onDelete(quiz.id);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(false);
  };

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
  const r1Count = questions.filter(q => q.round === 1).length;
  const r2Count = questions.filter(q => q.round === 2).length;
  const r3Count = questions.filter(q => q.round === 3).length;
  const isReady = r1Count >= 6 && r2Count >= 6 && r3Count >= 6;

  const creatorName = quiz.users ? (quiz.users.username || [quiz.users.first_name, quiz.users.last_name].filter(Boolean).join(' ') || 'Unknown Creator') : null;

  const [isHosting, setIsHosting] = useState(false);

  const handleHostClick = async () => {
    if (!isReady) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    try {
      setIsHosting(true);
      const { pin } = await api.post('/api/game/host', { quizId: quiz.id });
      // Store quizId so HostLobby can emit host:initialize
      sessionStorage.setItem(`game_${pin}_quizId`, quiz.id);
      navigate(`/host/lobby/${pin}`);
    } catch (err) {
      console.error("Host Error:", err);
      setApiError(err?.response?.data?.error || err.message || 'Failed to host game');
      setTimeout(() => setApiError(null), 3000);
    } finally {
      setIsHosting(false);
    }
  };

  return (
    <div className="bg-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[320px] rounded-xl overflow-hidden relative">
      
      {/* Confirmation Modal Overlay */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 text-center border-[3px] border-zk-black rounded-xl"
          >
            <h4 className="font-black text-zk-black mb-2 uppercase tracking-wide">Make Public?</h4>
            <p className="text-sm font-bold text-gray-600 mb-4 leading-tight">
              Are you sure you want to post this quiz to Discovery? Others will be able to play and clone it.
            </p>
            <div className="flex gap-2 w-full">
              <button 
                onClick={handleCancelPublic}
                className="flex-1 bg-white text-zk-black border-[2px] border-zk-black py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-lg active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
              >
                No
              </button>
              <button 
                onClick={handleConfirmPublic}
                className="flex-1 bg-zk-blue text-white border-[2px] border-zk-black py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-lg active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
              >
                Yes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 text-center border-[3px] border-zk-black rounded-xl"
          >
            <h4 className="font-black text-[#FF4B4B] mb-2 uppercase tracking-wide">Delete Quiz?</h4>
            <p className="text-sm font-bold text-gray-600 mb-4 leading-tight">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
            <div className="flex gap-2 w-full">
              <button 
                onClick={handleCancelDelete}
                className="flex-1 bg-white text-zk-black border-[2px] border-zk-black py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-lg active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
              >
                No
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 bg-[#FF4B4B] text-white border-[2px] border-zk-black py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-lg active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Area */}
      <div className="h-32 border-b-[3px] border-zk-black bg-[#E0E0E0] overflow-hidden relative">
        {quiz.cover_image ? (
          <img src={quiz.cover_image} alt={quiz.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zk-black/30 font-bold">
            No Image
          </div>
        )}
        
        {/* Visibility Toggle */}
        {!isDiscoveryMode && !quiz.is_clone && (
          <button
            onClick={handleToggleClick}
            className={`absolute top-2 right-2 p-1.5 border-[2px] border-zk-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all ${
              isPublic ? 'bg-zk-yellow text-zk-black' : 'bg-white text-gray-500'
            }`}
            title={isPublic ? "Public Quiz" : "Private Quiz"}
          >
            {isPublic ? <Globe size={16} /> : <Lock size={16} />}
          </button>
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
          <p className="text-xs text-gray-500 font-bold flex flex-col gap-0.5 mt-1">
            <span>0 Plays • Created {timeAgo(quiz.created_at)}</span>
            {isDiscoveryMode && creatorName && (
              <span className="text-zk-blue truncate flex items-center gap-1">
                By @{creatorName}
              </span>
            )}
          </p>
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
                Please add at least 6 questions per round!
                <div className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FF4B4B] border-r-[3px] border-b-[3px] border-zk-black rotate-45" />
              </motion.div>
            )}
            {apiError && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: -55, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute left-0 right-0 bg-[#FF4B4B] text-white px-4 py-3 text-[10px] font-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] border-zk-black z-[50] flex items-center justify-center text-center uppercase"
              >
                {apiError}
                <div className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FF4B4B] border-r-[3px] border-b-[3px] border-zk-black rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {isDiscoveryMode ? (
            <div className="flex gap-2 w-full">
              <button
                onClick={() => onPreview && onPreview(quiz)}
                className="bg-white text-zk-black border-[2px] border-zk-black p-2 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none rounded-lg flex items-center justify-center transition-all"
                title="Preview Quiz"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => onClone && onClone(quiz.id)}
                className="flex-1 bg-zk-blue text-white border-[2px] border-zk-black py-2 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Copy size={16} /> Clone
              </button>
            </div>
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
                onClick={() => navigate('/create-game/' + quiz.id)}
                className="bg-white text-zk-black border-[2px] border-zk-black p-2 font-bold text-sm flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none rounded-lg"
                title="Edit Quiz"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={handleDeleteClick}
                className="bg-[#FF4B4B] text-white border-[2px] border-zk-black p-2 font-bold text-sm flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none rounded-lg"
                title="Delete Quiz"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
