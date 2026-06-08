"use client";
import React, { useMemo, memo } from 'react';
import { Plus } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';

const Sidebar = memo(() => {
  const { questions, activeQuestionId, activeRound, handleAddQuestion, setActiveQuestionId } = useQuiz();

  // Only re-compute when questions or activeRound changes
  const roundQuestions = useMemo(
    () => questions.filter(q => q.round === activeRound),
    [questions, activeRound]
  );

  return (
    <div className="w-80 bg-white/70 backdrop-blur-md border-r-[3px] border-zk-black flex flex-col h-full rounded-xl">
      <div className="h-[80px] px-6 border-b-[3px] border-zk-black bg-white/40 flex items-center shrink-0">
        <h2 className="font-bold text-zk-black uppercase tracking-wider text-sm">Question List</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 flex flex-col gap-4">
        {roundQuestions.map((q, index) => (
          <div
            key={q.id}
            onClick={() => setActiveQuestionId(q.id)}
            className={`relative p-4 border-[3px] border-zk-black rounded-lg cursor-pointer transition-transform hover:translate-y-[2px] hover:translate-x-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${q.id === activeQuestionId ? 'bg-[#5D3FD3] text-white' : 'bg-white text-zk-black'
              }`}
          >
            <div className="absolute -top-3 -left-2 bg-zk-black text-white text-xs font-bold px-1 py-0.5 rounded">
              Q{index + 1}
            </div>
            <p className="font-bold text-sm truncate">{q.text || 'Untitled Question'}</p>
          </div>
        ))}

        {/* Add Question Button inside the list */}
        <button
          onClick={handleAddQuestion}
          className="w-full bg-[#00C853] text-white border-[3px] border-zk-black py-3 font-black text-lg flex items-center justify-center gap-2 rounded-xl transition-transform hover:translate-y-[2px] hover:translate-x-[2px] active:translate-y-[4px] active:translate-x-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none mt-2"
        >
          <Plus size={24} strokeWidth={3} />
          ADD QUESTION
        </button>
      </div>
    </div>
  );
});

export default Sidebar;
