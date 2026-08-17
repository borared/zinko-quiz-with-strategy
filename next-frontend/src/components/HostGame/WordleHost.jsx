import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Skull, Trophy } from 'lucide-react';

const TEAM_STYLES = {
  A: { text: 'text-zk-red', border: 'border-zk-red', bg: 'bg-black', fill: 'fill-zk-red' },
  B: { text: 'text-[#4B9FFF]', border: 'border-[#4B9FFF]', bg: 'bg-black', fill: 'fill-[#4B9FFF]' },
  C: { text: 'text-zk-green', border: 'border-zk-green', bg: 'bg-black', fill: 'fill-zk-green' },
  D: { text: 'text-zk-yellow', border: 'border-zk-yellow', bg: 'bg-black', fill: 'fill-zk-yellow' },
};
const FALLBACK_STYLE = { text: 'text-white', border: 'border-white', bg: 'bg-black', fill: 'fill-white' };

const CELL_BG = {
  correct: 'bg-[#3498db] border-[#3498db] text-white font-bold shadow-[0_0_12px_rgba(52,152,219,0.6)]',
  present: 'bg-[#e67e22] border-[#e67e22] text-white font-bold shadow-[0_0_12px_rgba(230,126,34,0.6)]',
  absent: 'bg-[#34495e] border-[#34495e] text-white/80 font-bold',
  empty: 'border-white/10 bg-black/20 text-transparent'
};

export default function WordleHost({ wordleData }) {
  const { wordLength = 5, hint, category, state, teams = ['A', 'B'], teamNames = {} } = wordleData;

  const renderTeam = (teamName, teamData) => {
    const style = TEAM_STYLES[teamName] || FALLBACK_STYLE;
    const guesses = teamData.guesses || [];
    const maxAttempts = 5;
    const isSolved = guesses.some(g => g.result.every(res => res === 'correct'));

    return (
      <div key={teamName} className={`w-[calc((100%-4rem)/3)] min-w-[320px] flex flex-col items-center justify-start p-6 border-2 ${style.border} ${style.bg} rounded-xl relative shadow-2xl`}>
        <h2 className={`text-4xl font-black mb-6 ${style.text} tracking-widest`}>
          {teamNames[teamName] || `Team ${teamName}`}
        </h2>
        
        {/* Attempt Progress Indicators - Always visible for uniformity */}
        <div className="flex flex-col items-center justify-center gap-4 py-8 w-full">
          <div className="text-white/60 font-bold uppercase tracking-widest text-sm">Attempts Used</div>
          <div className="flex gap-3">
            {Array.from({ length: maxAttempts }).map((_, idx) => {
              const isUsed = idx < guesses.length;
              return (
                <motion.div
                  key={idx}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-xl transition-all duration-300 ${
                    isUsed
                      ? 'bg-[#3498db] border-[#3498db] text-white shadow-[0_0_12px_rgba(52,152,219,0.6)]'
                      : 'border-white/10 bg-white/5 text-white/20'
                  }`}
                  animate={isUsed ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {idx + 1}
                </motion.div>
              );
            })}
          </div>
          <p className="text-white/80 font-black text-xl mt-2 tracking-wide">
            {guesses.length} / {maxAttempts} Attempts
          </p>
        </div>

        {/* Elegant status badges positioned at the top left edge */}
        {teamData.isEliminated && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            className="absolute -top-4 -left-6 flex items-center gap-2 bg-zk-red px-6 py-2.5 rounded-xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            <Skull className="w-6 h-6 text-white" />
            <span className="text-white font-black text-xl tracking-wide">Eliminated</span>
          </motion.div>
        )}

        {isSolved && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            className="absolute -top-4 -left-6 flex items-center gap-2 bg-zk-yellow px-6 py-2.5 rounded-xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            <Trophy className="w-6 h-6 text-black" />
            <span className="text-black font-black text-xl tracking-wide">Solved</span>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col p-8 z-20 overflow-hidden">
      
      <div className="text-center mb-6 relative z-10">
        <h1 className="gasoek-one-regular text-5xl sm:text-7xl text-zk-yellow tracking-widest drop-shadow-[0_6px_0_#000] stroke-black stroke-2" style={{ WebkitTextStroke: '3px black' }}>
          Five Grid Word Battle
        </h1>
        <div className="mt-4 flex flex-row flex-wrap justify-center items-center gap-4">
          {category && (
            <div className="text-4xl font-bold text-white uppercase tracking-widest bg-black px-8 h-[54px] inline-flex items-center justify-center rounded-full border-2 border-white shadow-xl" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '4px' }}>
              {category}
            </div>
          )}

        </div>
      </div>

      <div className="flex-1 flex flex-wrap gap-8 max-w-[1600px] w-full mx-auto justify-center items-start pt-8 relative z-10 overflow-y-auto pb-8 scrollbar-hide">
        {teams.map((teamName, index) => (
          <React.Fragment key={teamName}>
            {renderTeam(teamName, state?.[teamName] || { lives: 5, guesses: [], isEliminated: false })}
            {index < teams.length - 1 && teams.length === 2 && (
              <div className="hidden lg:flex flex-col justify-center items-center px-2">
                <div className="w-1 h-32 bg-white/10 rounded-full mb-4" />
                <span className="text-4xl font-black text-white/40 italic">VS</span>
                <div className="w-1 h-32 bg-white/10 rounded-full mt-4" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
