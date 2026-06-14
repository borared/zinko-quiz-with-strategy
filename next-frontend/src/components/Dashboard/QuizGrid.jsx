"use client";
import React from 'react';
import QuizCard from './QuizCard';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
;

const QuizGrid = ({ quizzes, loading, isDiscoveryMode }) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/50 animate-pulse border-[3px] border-zk-black rounded-xl h-[320px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="font-black text-2xl text-zk-black uppercase tracking-tight">
          {isDiscoveryMode ? 'Public Quizzes' : (quizzes.length > 0 ? 'Your Quizzes' : 'No Quizzes Found')}
        </h2>
        <button className="text-sm font-bold text-zk-black hover:underline">View All</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} isDiscoveryMode={isDiscoveryMode} />
        ))}

        {/* Create New Quiz Card - hidden in Discovery mode */}
        {!isDiscoveryMode && (
          <div
            onClick={() => router.push('/create-game')}
            className="border-[3px] border-dashed border-zk-black p-8 flex flex-col items-center justify-center gap-4 bg-white/50 cursor-pointer hover:bg-white transition-colors h-[320px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl"
          >
            <div className="w-12 h-12 rounded-full border-[3px] border-zk-black flex items-center justify-center bg-white">
              <Plus size={24} className="text-zk-black" strokeWidth={3} />
            </div>
            <p className="font-bold text-zk-black">Create New Quiz</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGrid;
