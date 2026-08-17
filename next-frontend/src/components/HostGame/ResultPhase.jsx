"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import AnswerBarChart from './AnswerBarChart';


export default function ResultPhase({ question, stats, leaderboard, handleShowLeaderboard, handleNextQuestion }) {
  const teamAScore = leaderboard.filter(p => p.team === 'A').reduce((sum, p) => sum + (p.score || 0), 0);
  const teamBScore = leaderboard.filter(p => p.team === 'B').reduce((sum, p) => sum + (p.score || 0), 0);

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen max-h-screen overflow-hidden flex flex-col bg-zk-bg relative"
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
        className="absolute top-[10%] left-[10%] w-20 h-20 bg-zk-blue border-[2px] border-zk-border rounded-lg pointer-events-none"
      />
      <motion.div
        animate={{ y: [15, -15, 15], rotate: -360 }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 12, repeat: Infinity, ease: "linear" }
        }}
        className="absolute top-[5%] right-[15%] w-16 h-16 bg-[#6E5CF2] border-[2px] border-zk-border rounded-lg pointer-events-none"
      />
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] left-[10%] w-12 h-12 bg-[#FF6B6B] border-[2px] border-zk-border rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[5%] right-[15%] w-24 h-24 bg-[#FDE08B] border-[2px] border-zk-border rounded-lg pointer-events-none"
      />

      <div className="relative z-10 flex flex-col flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full h-full justify-center">
        {/* Top: Header */}
        <div className="flex-shrink-0 mt-2">
          <h2 className="text-center text-4xl md:text-5xl font-black mb-2 text-zk-text uppercase permanent-marker-regular">
            Results
          </h2>
          {question && (
            <p className="text-center text-zk-text font-black text-xl mb-2">
              {question.questionText}
            </p>
          )}
        </div>

        {/* Middle: 2 Columns */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 min-h-0 items-center justify-center py-4">
          
          {/* Left Panel: Answer breakdown */}
          <div className="flex-1 w-full h-full flex flex-col justify-center items-center">
            <p className="text-center text-zk-text/40 mb-6 tracking-widest text-sm md:text-base font-bold flex-shrink-0">
              Answer Breakdown
            </p>
            <div className="w-full max-w-2xl mx-auto flex flex-col justify-center">
              <AnswerBarChart
                stats={stats}
                revealed={true}
                questionType={question?.questionType}
              />
            </div>
          </div>

          {/* Right Panel: Top Players */}
          <div className="flex-1 w-full h-full flex flex-col justify-center items-center lg:border-l-[2px] border-white/10 lg:pl-12">
            <p className="text-zk-text/50 tracking-widest text-sm md:text-base mb-6 font-black text-center flex-shrink-0">
              Top Players
            </p>
            <div className="flex justify-center items-end gap-x-6 lg:gap-x-10 mt-16 mb-8">
              {(() => {
                const top3 = leaderboard.slice(0, 3);
                const podium = [];
                // Layout: 2nd, 1st, 3rd
                if (top3[1]) podium.push({ p: top3[1], rank: 2 });
                if (top3[0]) podium.push({ p: top3[0], rank: 1 });
                if (top3[2]) podium.push({ p: top3[2], rank: 3 });

                return podium.map(({ p, rank }) => (
                  <div 
                    key={p.id} 
                    className={`flex flex-col items-center transition-all ${
                      rank === 1 ? 'z-20 -translate-y-12 scale-[1.15]' : 
                      rank === 2 ? 'z-10 -translate-y-2' : 
                      'z-10 translate-y-6 scale-[0.9]'
                    }`}
                  >
                    <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-lg border-[2px] border-zk-border bg-zk-panel-bg flex items-center justify-center flex-shrink-0">
                      {p.avatar ? (
                        <img src={p.avatar} alt={p.nickname} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="font-black text-4xl text-zk-text/30">?</div>
                      )}
                      {/* Team badge at top left edge */}
                      {p.team && (
                        <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full border-[2px] border-zk-border flex items-center justify-center font-black text-sm z-10 text-white ${p.team === 'A' ? 'bg-[#27AE60]' : 'bg-[#E74C3C]'}`}>
                          {p.team}
                        </div>
                      )}
                      {/* Rank badge at top right edge (Gold, Silver, Bronze) */}
                      <div className={`absolute -top-3 -right-3 text-white w-8 h-8 rounded-full border-[2px] border-zk-border flex items-center justify-center font-black text-sm z-10 ${
                        rank === 1 ? 'bg-[#F1C40F]' :
                        rank === 2 ? 'bg-[#95A5A6]' :
                        'bg-[#D35400]'
                      }`}>
                        #{rank}
                      </div>
                      {/* Name badge at bottom right edge */}
                      <div className="absolute -bottom-3 -right-6 bg-zk-panel-bg border-[2px] border-zk-border rounded-lg px-3 py-1.5 z-10 min-w-[70px]">
                        <span className="font-black text-zk-text text-sm truncate max-w-[100px] block text-center leading-none">
                          {p.nickname}
                        </span>
                      </div>
                    </div>
                    {/* Score outside at the bottom */}
                    <div className="mt-6 font-black text-zk-text text-lg uppercase tracking-wider">
                      {p.score?.toLocaleString() || 0} pts
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Bottom: Actions */}
        <div className="flex justify-center gap-4 flex-shrink-0 mt-16 mb-4">
          <button
            onClick={handleShowLeaderboard}
            className="min-w-[200px] px-8 py-3 bg-zk-panel-bg border-[2px] border-zk-border rounded-lg text-zk-text font-black text-lg tracking-widest hover:brightness-95 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Trophy size={20} /> Leaderboard
          </button>
          <button
            id="next-question-btn"
            onClick={handleNextQuestion}
            className="min-w-[200px] px-8 py-3 bg-[#5D3FD3] border-[2px] border-zk-border rounded-lg text-white font-black text-lg tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Next Question <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
