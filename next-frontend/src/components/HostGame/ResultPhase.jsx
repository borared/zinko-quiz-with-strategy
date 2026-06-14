"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import AnswerBarChart from './AnswerBarChart';


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

      {/* Floating Shapes */}
      <motion.div
        animate={{ y: [-15, 15, -15], rotate: 360 }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 10, repeat: Infinity, ease: "linear" }
        }}
        className="absolute top-[10%] left-[10%] w-20 h-20 bg-zk-blue border-[4px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [15, -15, 15], rotate: -360 }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 12, repeat: Infinity, ease: "linear" }
        }}
        className="absolute top-[5%] right-[15%] w-16 h-16 bg-[#6E5CF2] border-[4px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] left-[10%] w-12 h-12 bg-[#FF6B6B] border-[4px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[5%] right-[15%] w-24 h-24 bg-[#FDE08B] border-[4px] border-zk-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col flex-1 p-4 md:p-6 justify-center">
        <h2 className="text-center text-4xl md:text-5xl font-black mb-1 text-zk-black uppercase permanent-marker-regular">
          Results
        </h2>
        {question && (
          <p className="text-center text-zk-black font-black text-xl mb-1">
            {question.questionText}
          </p>
        )}
        <p className="text-center text-zk-black/40 mb-4 uppercase tracking-widest text-xs md:text-sm font-bold">
          Answer breakdown
        </p>

        {/* Bar chart */}
        <div className="mb-4 mt-2">
          <AnswerBarChart stats={stats} revealed={true} />
        </div>

        {/* Mini leaderboard */}
        <div className="mb-4 mt-8">
          <p className="text-zk-black/50 uppercase tracking-widest text-xs md:text-sm mb-6 font-black text-center">
            Top Players
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 mt-6">
            {leaderboard.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-3xl border-[4px] border-zk-black shadow-[6px_6px_0_#000] bg-white flex items-center justify-center flex-shrink-0">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.nickname} className="w-full h-full object-cover rounded-[20px]" />
                  ) : (
                    <div className="font-black text-4xl text-zk-black/30">?</div>
                  )}
                  {/* Rank badge at top right edge */}
                  <div className="absolute -top-4 -right-4 bg-[#5D3FD3] text-white w-10 h-10 rounded-full border-[3px] border-zk-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0_#000] z-10">
                    #{i + 1}
                  </div>
                  {/* Name badge at bottom right edge */}
                  <div className="absolute -bottom-4 -right-8 bg-white border-[3px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl px-4 py-2 z-10 min-w-[80px]">
                    <span className="font-black text-zk-black text-lg truncate max-w-[120px] block text-center leading-none">
                      {p.nickname}
                    </span>
                  </div>
                </div>
                {/* Score outside at the bottom */}
                <div className="mt-6 font-black text-zk-black text-lg uppercase tracking-wider">
                  {p.score?.toLocaleString() || 0} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={handleShowLeaderboard}
            style={{ fontFamily: 'var(--font-amatic-sc)' }}
            className="min-w-[240px] px-8 py-4 bg-white border-[3px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl text-zk-black font-black text-3xl tracking-widest hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_#000] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Trophy size={24} /> Leaderboard
          </button>
          <button
            id="next-question-btn"
            onClick={handleNextQuestion}
            style={{ fontFamily: 'var(--font-amatic-sc)' }}
            className="min-w-[240px] px-8 py-4 bg-[#5D3FD3] border-[3px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl text-white font-black text-3xl tracking-widest hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_#000] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            Next Question <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
