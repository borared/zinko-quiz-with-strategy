import React from 'react';
import { Plus } from 'lucide-react';

const Sidebar = ({ questions, activeQuestionId, onAddQuestion, onSelectQuestion }) => {
  return (
    <div className="w-80 bg-[#F5F5F5] border-r-[3px] border-zk-black flex flex-col h-full rounded-xl">
      <div className="p-4 border-b-[3px] border-zk-black bg-white rounded-xl">
        <h2 className="font-bold text-zk-black uppercase tracking-wider text-sm">Question List</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {questions.map((q) => (
          <div 
            key={q.id}
            onClick={() => onSelectQuestion(q.id)}
            className={`relative p-4 border-[3px] border-zk-black rounded-lg cursor-pointer transition-transform hover:translate-y-[2px] hover:translate-x-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              q.id === activeQuestionId ? 'bg-[#5D3FD3] text-white' : 'bg-white text-zk-black'
            }`}
          >
            <div className="absolute -top-3 -left-2 bg-zk-black text-white text-xs font-bold px-1 py-0.5 rounded">
              Q{q.id}
            </div>
            <p className="font-bold text-sm truncate">{q.text}</p>
          </div>
        ))}
        
        {/* Add Question Button inside the list */}
        <button 
          onClick={onAddQuestion}
          className="w-full bg-[#00C853] text-white border-[3px] border-zk-black py-3 font-black text-lg flex items-center justify-center gap-2 rounded-xl transition-transform hover:translate-y-[2px] hover:translate-x-[2px] active:translate-y-[4px] active:translate-x-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none mt-2"
        >
          <Plus size={24} strokeWidth={3} />
          ADD QUESTION
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
