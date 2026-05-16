import React from 'react';
import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizCard = ({ quiz }) => {
  const navigate = useNavigate();
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="bg-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[320px] rounded-xl overflow-hidden">
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
          {/* Subject Tag (Static for now or based on metadata) */}
          <div className={`bg-[#5D3FD3] text-white text-xs font-bold px-2 py-0.5 w-max border-[1.5px] border-zk-black rounded-lg uppercase`}>
            {quiz.questions?.length || 0} Questions
          </div>
          
          {/* Title */}
          <h3 className="font-black text-lg text-zk-black mt-1 leading-tight line-clamp-2">{quiz.title}</h3>
          
          {/* Subtitle */}
          <p className="text-xs text-gray-500 font-bold">
            0 Plays • Created {timeAgo(quiz.created_at)}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-2">
          <button className="flex-1 bg-[#5D3FD3] text-white border-[2px] border-zk-black py-2 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none rounded-lg">
            Host
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
