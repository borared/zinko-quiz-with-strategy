import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Skull } from 'lucide-react';

export default function HangmanHost({ hangmanData }) {
  const { wordLength, hint, category, state } = hangmanData;
  const teamA = state?.A || { lives: 0, isEliminated: false };
  const teamB = state?.B || { lives: 0, isEliminated: false };

  const renderTeam = (teamName, teamData, colorClass, borderClass, bgClass) => {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 border-4 ${borderClass} ${bgClass} rounded-2xl relative overflow-hidden shadow-2xl`}>
        <h2 className={`text-4xl font-black mb-8 ${colorClass} uppercase tracking-widest`}>
          Team {teamName}
        </h2>
        
        {teamData.isEliminated ? (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center flex-1"
          >
            <Skull className={`w-32 h-32 ${colorClass} mb-4 animate-pulse`} />
            <h2 className="gasoek-one-regular text-5xl text-white mb-6 text-center drop-shadow-[0_4px_0_#000]">Eliminated</h2>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex items-center gap-3 bg-white/20 px-6 py-4 rounded-full border-[4px] border-black shadow-[4px_4px_0_#000]">
                <Heart className={`w-10 h-10 ${teamName === 'A' ? 'text-zk-red fill-zk-red' : 'text-zk-blue fill-zk-blue'} animate-pulse`} />
                <span className="text-4xl font-black text-white">{teamData.lives}</span>
                <span className="text-xl text-white/50 uppercase tracking-widest font-bold">Lives</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center p-6 bg-black/40 rounded-3xl border-[4px] border-black">
              {Array.from({ length: wordLength }).map((_, i) => (
                <div 
                  key={i}
                  className="w-12 h-16 sm:w-16 sm:h-20 border-b-8 border-white/20 flex flex-col justify-end pb-2"
                >
                  <span className="w-full text-center text-4xl text-white/10 font-black">_</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col p-8 z-20 overflow-hidden">
      <img src="/images/model_answer/right.png" alt="Mascot" className="absolute top-0 right-0 w-64 h-64 z-0 opacity-80" />
      
      <div className="text-center mb-6 relative z-10">
        <h1 className="gasoek-one-regular text-7xl text-zk-yellow uppercase tracking-widest drop-shadow-[0_6px_0_#000] stroke-black stroke-2" style={{ WebkitTextStroke: '3px black' }}>
          HANGMAN BATTLE
        </h1>
        {category && (
          <div className="mt-2 text-4xl font-bold text-white uppercase tracking-widest drop-shadow-[0_4px_0_#000]" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '4px' }}>
            {category}
          </div>
        )}
        {hint && (
          <div className="mt-4 bg-zk-blue inline-block px-12 py-4 rounded-full border-[6px] border-black shadow-[8px_8px_0_#000] rotate-1 transform">
            <p className="text-white/80 font-bold uppercase tracking-widest text-sm mb-1" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>Hint</p>
            <p className="text-3xl text-white font-bold">{hint}</p>
          </div>
        )}
      </div>

      <div className="flex-1 flex gap-12 max-w-[1400px] w-full mx-auto relative z-10">
        {renderTeam('A', teamA, 'text-zk-red', 'border-zk-red', 'bg-zk-red/10')}
        
        <div className="flex flex-col justify-center items-center px-4">
          <div className="w-1 h-32 bg-white/20 rounded-full mb-4" />
          <span className="text-4xl font-black text-white/40 italic">VS</span>
          <div className="w-1 h-32 bg-white/20 rounded-full mt-4" />
        </div>

        {renderTeam('B', teamB, 'text-[#4B9FFF]', 'border-[#4B9FFF]/30', 'bg-[#4B9FFF]/10')}
      </div>
    </div>
  );
}
