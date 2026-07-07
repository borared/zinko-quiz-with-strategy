"use client";
import React from 'react';
import QuizCard from './QuizCard';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const QuizGrid = ({ quizzes, loading, isDiscoveryMode, totalQuizCount = null }) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 zk-skeleton rounded-lg border-[3px] border-zk-black/20" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="zk-skeleton border-[3px] border-zk-black rounded-xl h-[320px]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!isDiscoveryMode && (
        <div className="zk-panel-glass !shadow-none px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-['Outfit'] text-3xl font-black text-zk-black tracking-tight uppercase">
              {quizzes.length > 0 ? 'Your Quizzes' : 'No Quizzes Yet'}
            </h2>
            <p className="text-sm font-bold text-zk-black/60 mt-1">
              {quizzes.length > 0
                ? 'Pick a quiz to host or edit'
                : 'Create your first battle-ready quiz below'}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end shrink-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zk-black/50">
              Total Quizzes
            </p>
            <p className="font-['Outfit'] text-5xl font-black text-zk-purple leading-none">
              {totalQuizCount ?? quizzes.length}
            </p>
          </div>
        </div>
      )}

      {quizzes.length === 0 && !isDiscoveryMode ? (
        <div
          onClick={() => router.push('/create-game')}
          className="zk-panel !shadow-none border-dashed p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white transition-colors min-h-[280px] text-center"
        >
          <div className="w-16 h-16 rounded-full border-[3px] border-zk-black bg-zk-yellow flex items-center justify-center">
            <Plus size={32} strokeWidth={3} />
          </div>
          <h3 className="zk-section-title text-3xl">Start Your First Quiz</h3>
          <p className="font-bold text-zk-black/60 max-w-md">
            Build 3 rounds of questions, add a cover image, and host a live game in minutes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} isDiscoveryMode={isDiscoveryMode} />
          ))}

          {!isDiscoveryMode && quizzes.length > 0 && (
            <div
              onClick={() => router.push('/create-game')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && router.push('/create-game')}
              className="border-[3px] border-dashed border-zk-black p-8 flex flex-col items-center justify-center gap-4 bg-white/70 cursor-pointer hover:bg-white hover:-translate-y-0.5 transition-all h-[320px] !shadow-none rounded-xl group"
            >
              <div className="w-14 h-14 rounded-full border-[3px] border-zk-black flex items-center justify-center bg-zk-purple text-white group-hover:scale-105 transition-transform">
                <Plus size={28} strokeWidth={3} />
              </div>
              <p className="font-bold text-zk-black amatic-sc-regular text-2xl">Create New Quiz</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGrid;