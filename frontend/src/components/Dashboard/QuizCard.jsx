import React, { useState } from 'react';
import { Pencil, Play, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const QuizCard = ({ quiz }) => {
  const navigate = useNavigate();
  const [showError, setShowError] = React.useState(false);

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
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsHosting(false);
    }
  };

  return (
    <div className="bg-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[320px] rounded-xl overflow-hidden relative">
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
          </AnimatePresence>

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
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
