"use client";
import React, { useMemo, memo } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/store/useQuizStore';

const Sidebar = memo(() => {
  const {
    questions,
    activeQuestionId,
    activeRound,
    handleAddQuestion,
    setActiveQuestionId,
  } = useQuizStore();

  const roundQuestions = useMemo(
    () => questions.filter((q) => q.round === activeRound),
    [questions, activeRound]
  );

  return (
    <div className="h-full zk-panel border-t-0 border-l-0 rounded-none flex flex-col overflow-hidden">
      <div className="h-16 px-5 border-b-[3px] border-zk-black flex items-center justify-between shrink-0 bg-zk-yellow/30">
        <h2 className="font-black text-zk-black uppercase tracking-wider text-sm">
          Questions
        </h2>
        <span className="text-[10px] font-bold bg-zk-purple text-white px-2 py-0.5 rounded border border-zk-black">
          R{activeRound}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3">
        <AnimatePresence>
          {roundQuestions.map((q, index) => (
            <motion.button
              type="button"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              transition={{ duration: 0.15 }}
              key={q.id}
              onClick={() => setActiveQuestionId(q.id)}
              className={`relative w-full text-left p-3 border-[3px] border-zk-black rounded-lg transition-all zk-btn-press ${
                q.id === activeQuestionId
                  ? 'bg-zk-purple text-white'
                  : 'bg-white text-zk-black hover:bg-zk-yellow/20'
              }`}
            >
              <span className="absolute -top-2.5 -left-1 bg-zk-black text-white text-[10px] font-black px-1.5 py-0.5 rounded border border-zk-black">
                Q{index + 1}
              </span>
              <p className="font-bold text-sm truncate pt-1">
                {q.text || 'Untitled Question'}
              </p>
            </motion.button>
          ))}
        </AnimatePresence>

        {roundQuestions.length === 0 ? (
          <>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full zk-btn-press bg-zk-green text-white py-3 font-black text-sm flex items-center justify-center gap-2 rounded-xl"
            >
              <Plus size={20} strokeWidth={3} />
              Add Question
            </button>
            <p className="text-center text-xs font-bold text-zk-black/40 py-4 px-2">
              No questions in this round yet
            </p>
          </>
        ) : (
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full zk-btn-press bg-zk-green text-white py-3 font-black text-sm flex items-center justify-center gap-2 rounded-xl mt-1"
          >
            <Plus size={20} strokeWidth={3} />
            Add Question
          </button>
        )}
      </div>
    </div>
  );
});

Sidebar.displayName = 'CreatorSidebar';

export default Sidebar;