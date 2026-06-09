"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import AnswerBarChart from './AnswerBarChart';

const MEDAL = ["🥇", "🥈", "🥉"];

export default function ResultPhase({ question, stats, leaderboard, handleShowLeaderboard, handleNextQuestion }) {
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-zk-yellow relative"
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%), repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%)",
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0, 15px 15px",
        }}
      />

      <div className="relative z-10 flex flex-col flex-1 p-8">
        <h2 className="text-center text-5xl font-black mb-2 text-zk-black uppercase permanent-marker-regular">
          Results
        </h2>
        {question && (
          <p className="text-center text-zk-black font-black text-2xl mb-2">
            {question.questionText}
          </p>
        )}
        <p className="text-center text-zk-black/40 mb-8 uppercase tracking-widest text-sm font-bold">
          Answer breakdown
        </p>

        {/* Bar chart */}
        <div className="bg-white border-[4px] border-zk-black shadow-[8px_8px_0_#000] rounded-2xl p-8 mb-6">
          <AnswerBarChart stats={stats} revealed={true} />
        </div>

        {/* Mini leaderboard */}
        <div className="bg-white border-[4px] border-zk-black shadow-[6px_6px_0_#000] rounded-2xl p-6 mb-6">
          <p className="text-zk-black/50 uppercase tracking-widest text-xs mb-4 font-black">
            Top Players
          </p>
          <div className="flex gap-4">
            {leaderboard.slice(0, 5).map((p, i) => (
              <div
                key={p.id}
                className="flex-1 bg-zk-yellow/30 border-[2px] border-zk-black rounded-xl p-3 text-center"
              >
                <div className="text-xl mb-1">
                  {MEDAL[i] || `#${i + 1}`}
                </div>
                <p className="text-zk-black font-bold text-sm truncate">
                  {p.nickname}
                </p>
                <p className="text-[#5D3FD3] font-black text-sm">
                  {p.score?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleShowLeaderboard}
            className="flex-1 py-4 bg-white border-[3px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl text-zk-black font-black text-lg uppercase tracking-widest hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_#000] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Trophy size={20} /> Leaderboard
          </button>
          <button
            id="next-question-btn"
            onClick={handleNextQuestion}
            className="flex-1 py-4 bg-[#5D3FD3] border-[3px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl text-white font-black text-lg uppercase tracking-widest hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_#000] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            Next Question <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
