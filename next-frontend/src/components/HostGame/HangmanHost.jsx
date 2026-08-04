import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Skull } from 'lucide-react';

const TEAM_STYLES = {
  A: { text: 'text-zk-red', border: 'border-zk-red', bg: 'bg-black', fill: 'fill-zk-red' },
  B: { text: 'text-[#4B9FFF]', border: 'border-[#4B9FFF]', bg: 'bg-black', fill: 'fill-[#4B9FFF]' },
  C: { text: 'text-zk-green', border: 'border-zk-green', bg: 'bg-black', fill: 'fill-zk-green' },
  D: { text: 'text-zk-yellow', border: 'border-zk-yellow', bg: 'bg-black', fill: 'fill-zk-yellow' },
};
const FALLBACK_STYLE = { text: 'text-white', border: 'border-white', bg: 'bg-black', fill: 'fill-white' };

export default function HangmanHost({ hangmanData }) {
  const { wordLength, hint, category, state, teams = ['A', 'B'], teamNames = {} } = hangmanData;

  const renderTeam = (teamName, teamData) => {
    const style = TEAM_STYLES[teamName] || FALLBACK_STYLE;
    return (
      <div key={teamName} className={`flex-1 min-w-[300px] flex flex-col items-center justify-center p-8 border-4 ${style.border} ${style.bg} rounded-2xl relative overflow-hidden shadow-2xl`}>
        <h2 className={`text-4xl font-black mb-8 ${style.text} tracking-widest`}>
          {teamNames[teamName] || `Team ${teamName}`}
        </h2>
        
        {teamData.isEliminated ? (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center flex-1"
          >
            <Skull className={`w-32 h-32 ${style.text} mb-4 animate-pulse`} />
            <h2 className="gasoek-one-regular text-5xl text-white mb-6 text-center drop-shadow-[0_4px_0_#000]">Eliminated</h2>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex items-center gap-3 bg-white/20 px-6 py-4 rounded-full border-[4px] border-black shadow-[4px_4px_0_#000]">
                <Heart className={`w-10 h-10 ${style.text} ${style.fill} animate-pulse`} />
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
      
      <div className="text-center mb-6 relative z-10">
        <h1 className="gasoek-one-regular text-7xl text-zk-yellow uppercase tracking-widest drop-shadow-[0_6px_0_#000] stroke-black stroke-2" style={{ WebkitTextStroke: '3px black' }}>
          HANGMAN BATTLE
        </h1>
        <div className="mt-4 flex flex-row flex-wrap justify-center items-center gap-4">
          {category && (
            <div className="text-4xl font-bold text-white uppercase tracking-widest drop-shadow-[0_4px_0_#000] bg-black/70 px-8 h-[54px] inline-flex items-center justify-center rounded-full border-2 border-white" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '4px' }}>
              {category}
            </div>
          )}
          {hint && (
            <div className="bg-zk-blue inline-flex flex-row items-center justify-center gap-4 px-8 h-[54px] rounded-full border-[3px] border-black shadow-xl">
              <span className="bg-black/20 text-white font-black uppercase tracking-widest text-xs px-3 py-1 rounded-full">Hint</span>
              <span className="text-2xl text-white font-black drop-shadow-sm">{hint}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-wrap gap-12 max-w-[1600px] w-full mx-auto justify-center relative z-10 overflow-y-auto pb-8">
        {teams.map((teamName, index) => (
          <React.Fragment key={teamName}>
            {renderTeam(teamName, state?.[teamName] || { lives: 0, isEliminated: false })}
            {index < teams.length - 1 && teams.length === 2 && (
              <div className="hidden md:flex flex-col justify-center items-center px-4">
                <div className="w-1 h-32 bg-white/20 rounded-full mb-4" />
                <span className="text-4xl font-black text-white/40 italic">VS</span>
                <div className="w-1 h-32 bg-white/20 rounded-full mt-4" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
