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
    () => questions.filter((q) => Number(q.round) === Number(activeRound)),
    [questions, activeRound]
  );

  return (
    <div className="h-full zk-panel border-t-0 border-l-0 rounded-none flex flex-col overflow-hidden">
      <div className="h-16 px-5 border-b-[3px] border-zk-border flex items-center justify-between shrink-0 bg-zk-bg/30">
        <h2 className="font-black text-zk-text uppercase tracking-wider text-sm">
          Questions
        </h2>
        <span className="text-[10px] font-bold bg-zk-purple text-white px-2 py-0.5 rounded border border-zk-border">
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
              className={`relative w-full text-left p-3 border-[3px] border-zk-border rounded-lg transition-colors ${
                q.id === activeQuestionId
                  ? 'bg-zk-purple text-white'
                  : 'bg-zk-panel-bg text-zk-text hover:bg-zk-bg/20'
              }`}
            >
              <span className="absolute -top-2.5 -left-1 bg-zk-black text-white text-[10px] font-black px-1.5 py-0.5 rounded border border-zk-border">
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
              className="w-full border-[3px] border-zk-border bg-zk-green text-white py-3 font-black text-sm flex items-center justify-center gap-2 rounded-xl transition-colors hover:bg-[#00b34a]"
            >
              <Plus size={20} strokeWidth={3} />
              Add Question
            </button>
            <p className="text-center text-xs font-bold text-zk-text/40 py-4 px-2">
              No questions in this round yet
            </p>
          </>
        ) : (
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full border-[3px] border-zk-border bg-zk-green text-white py-3 font-black text-sm flex items-center justify-center gap-2 rounded-xl mt-1 transition-colors hover:bg-[#00b34a]"
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