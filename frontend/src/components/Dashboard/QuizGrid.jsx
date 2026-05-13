import React from 'react';
import QuizCard from './QuizCard';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizGrid = () => {
  const navigate = useNavigate();
  
  const quizzes = [
    { id: 1, title: 'Quantum Physics 101', subject: 'SCIENCE', subjectColor: 'bg-[#FF4B4B]', plays: 45, created: '2 days ago', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'Ancient Civilizations', subject: 'HISTORY', subjectColor: 'bg-[#5D3FD3]', plays: '1.2k', trending: true, image: 'https://images.unsplash.com/photo-1543165365-07232ed12fad?auto=format&fit=crop&w=400&q=80' },
    { id: 3, title: 'French Verbs Master', subject: 'LANGUAGES', subjectColor: 'bg-[#FF6B4A]', plays: 89, created: 'last week', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="font-black text-2xl text-zk-black uppercase tracking-tight">Recent Quizzes</h2>
        <button className="text-sm font-bold text-zk-black hover:underline">View All</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}

        {/* Create New Quiz Card */}
        <div 
          onClick={() => navigate('/create-game')}
          className="border-[3px] border-dashed border-zk-black p-8 flex flex-col items-center justify-center gap-4 bg-white/50 cursor-pointer hover:bg-white transition-colors h-[320px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="w-12 h-12 rounded-full border-[3px] border-zk-black flex items-center justify-center bg-white">
            <Plus size={24} className="text-zk-black" strokeWidth={3} />
          </div>
          <p className="font-bold text-zk-black">Create New Quiz</p>
        </div>
      </div>
    </div>
  );
};

export default QuizGrid;
