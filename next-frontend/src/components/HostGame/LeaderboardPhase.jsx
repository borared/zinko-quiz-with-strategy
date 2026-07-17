"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';

export default function LeaderboardPhase({ leaderboard, isFinalLeaderboard, handleNextQuestion, handleEndGame }) {
  const teamA = leaderboard.filter((p) => p.team === "A").sort((a, b) => (b.score || 0) - (a.score || 0));
  const teamB = leaderboard.filter((p) => p.team === "B").sort((a, b) => (b.score || 0) - (a.score || 0));
  const teamAScore = teamA.reduce((sum, p) => sum + (p.score || 0), 0);
  const teamBScore = teamB.reduce((sum, p) => sum + (p.score || 0), 0);

  const totalScore = teamAScore + teamBScore;
  const teamAPercentage = totalScore > 0 ? (teamAScore / totalScore) * 100 : 50;

  const highestScore = leaderboard.length > 0 ? Math.max(...leaderboard.map(p => p.score || 0)) : 0;

  return (
    <motion.div
      key="leaderboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative overflow-hidden"
    >
      {/* Blue top half */}
      <div className="absolute inset-x-0 top-0 h-[55%] bg-[#3B68FF]" />
      {/* Yellow bottom half */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-zk-yellow" />

      {/* Floating decorations */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-6 left-8 w-8 h-8 bg-zk-yellow rounded-full border-[3px] border-zk-black z-20"
      />
      <motion.div
        animate={{ y: [6, -6, 6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-12 right-10 w-10 h-10 bg-[#5D3FD3] rounded-full border-[3px] border-zk-black z-20"
      />

      <div className="relative z-10 flex flex-col flex-1 items-center px-6 pt-6 pb-8">
        {/* Title */}
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-6xl font-black text-white uppercase permanent-marker-regular mb-6 text-center"
          style={{
            WebkitTextStroke: "3px #000",
            textShadow: "4px 4px 0 #000",
          }}
        >
          {isFinalLeaderboard ? "Final Podium" : "Leaderboard"}
        </motion.h2>

        {/* Tug of War Score Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="w-full max-w-4xl h-8 bg-zk-black rounded-full border-[3px] border-zk-black shadow-[4px_4px_0_#000] overflow-hidden flex relative mb-8"
        >
          <motion.div 
            className="h-full bg-[#27AE60]" 
            initial={{ width: "50%" }}
            animate={{ width: `${teamAPercentage}%` }}
            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
          />
          <motion.div 
            className="h-full bg-[#E74C3C]" 
            initial={{ width: "50%" }}
            animate={{ width: `${100 - teamAPercentage}%` }}
            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
          />
          {/* Center Indicator */}
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white -translate-x-1/2 z-10" />
        </motion.div>

        {/* Team panels container */}
        <div className="flex flex-1 w-full max-w-6xl gap-4 items-start relative mt-8">

          {/* Team A */}
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex-1 flex flex-col items-center relative"
          >
            {teamAScore >= teamBScore && (
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: [0, -12, 0] }}
                transition={{
                  scale: { delay: 0.5, type: "spring" },
                  y: { delay: 0.8, duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute -top-32 z-20 pointer-events-none"
              >
                <img src="/crown.png" alt="Crown" className="w-32 h-32 drop-shadow-[0_8px_0_rgba(0,0,0,1)]" />
              </motion.div>
            )}

            <div className="bg-[#27AE60] text-white font-black text-sm uppercase tracking-widest px-5 py-1.5 rounded-full border-[3px] border-zk-black shadow-[3px_3px_0_#000] mb-4">
              Team A
            </div>

            {/* Player list */}
            <div className="w-full space-y-3">
              {teamA.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 200 }}
                  className="bg-white border-[4px] border-zk-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] rounded-2xl px-5 py-4 flex items-center gap-4 w-full transition-shadow duration-200 cursor-default"
                >
                  <div className="font-black text-2xl text-zk-black/40 w-8 text-center flex-shrink-0">
                    #{i + 1}
                  </div>
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.nickname} className="w-12 h-12 rounded-xl object-cover border-[3px] border-zk-black shadow-[2px_2px_0_#000] flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-[#5D3FD3] rounded-xl flex items-center justify-center flex-shrink-0 border-[3px] border-zk-black shadow-[2px_2px_0_#000]">
                      <span className="text-white text-xl font-black">
                        {player.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-black text-zk-black flex-1 uppercase text-lg truncate text-left flex items-center gap-2">
                    {player.nickname}
                    {player.score === highestScore && highestScore > 0 && (
                      <span className="text-2xl" title="MVP">👑</span>
                    )}
                  </span>
                  <span className="font-black text-[#27AE60] text-2xl">
                    {player.score?.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Team total */}
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="text-5xl md:text-7xl font-black mt-6 gasoek-one-regular drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]"
              style={{
                color: "#FFFFFF",
                WebkitTextStroke: "3px #000",
                textShadow: "6px 6px 0px #000",
              }}
            >
              {teamAScore.toLocaleString()}
            </motion.p>
          </motion.div>

          {/* VS Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: [-6, 6, -6] }}
            transition={{
              scale: { delay: 0.3, type: "spring" },
              rotate: { delay: 0.5, duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="self-center bg-zk-black border-[4px] border-[#FFCD29] w-16 h-16 flex items-center justify-center rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.3)] flex-shrink-0 z-20"
          >
            <span className="font-black text-[#FFCD29] text-2xl">VS</span>
          </motion.div>

          {/* Team B */}
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex-1 flex flex-col items-center relative"
          >
            {teamBScore > teamAScore && (
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: [0, -12, 0] }}
                transition={{
                  scale: { delay: 0.5, type: "spring" },
                  y: { delay: 0.8, duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute -top-32 z-20 pointer-events-none"
              >
                <img src="/crown.png" alt="Crown" className="w-32 h-32 drop-shadow-[0_8px_0_rgba(0,0,0,1)]" />
              </motion.div>
            )}

            <div className="bg-[#E74C3C] text-white font-black text-sm uppercase tracking-widest px-5 py-1.5 rounded-full border-[3px] border-zk-black shadow-[3px_3px_0_#000] mb-4">
              Team B
            </div>

            {/* Player list */}
            <div className="w-full space-y-3">
              {teamB.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 200 }}
                  className="bg-white border-[4px] border-zk-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] rounded-2xl px-5 py-4 flex items-center gap-4 w-full transition-shadow duration-200 cursor-default"
                >
                  <div className="font-black text-2xl text-zk-black/40 w-8 text-center flex-shrink-0">
                    #{i + 1}
                  </div>
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.nickname} className="w-12 h-12 rounded-xl object-cover border-[3px] border-zk-black shadow-[2px_2px_0_#000] flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-[#E74C3C] rounded-xl flex items-center justify-center flex-shrink-0 border-[3px] border-zk-black shadow-[2px_2px_0_#000]">
                      <span className="text-white text-xl font-black">
                        {player.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-black text-zk-black flex-1 uppercase text-lg truncate text-left flex items-center gap-2">
                    {player.nickname}
                    {player.score === highestScore && highestScore > 0 && (
                      <span className="text-2xl" title="MVP">👑</span>
                    )}
                  </span>
                  <span className="font-black text-[#E74C3C] text-2xl">
                    {player.score?.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Team total */}
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="text-5xl md:text-7xl font-black mt-6 gasoek-one-regular drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]"
              style={{
                color: "#FFFFFF",
                WebkitTextStroke: "3px #000",
                textShadow: "6px 6px 0px #000",
              }}
            >
              {teamBScore.toLocaleString()}
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom buttons */}
        <div className="flex gap-4 mt-6 relative z-20">
          {!isFinalLeaderboard ? (
            <button
              id="next-after-leaderboard-btn"
              onClick={handleNextQuestion}
              className="bg-[#3B68FF] text-white border-[4px] border-zk-black shadow-[6px_6px_0_#000] rounded-xl px-12 py-4 font-black text-xl uppercase tracking-widest hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0_#000] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all flex items-center gap-3"
            >
              Next Question <ChevronRight size={22} />
            </button>
          ) : (
            <button
              id="end-game-btn"
              onClick={handleEndGame}
              className="bg-[#3B68FF] text-white border-[4px] border-zk-black shadow-[6px_6px_0_#000] rounded-xl px-12 py-3 amatic-sc-regular text-4xl uppercase tracking-widest hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0_#000] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all flex items-center gap-3"
            >
              <Home size={26} /> Home
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
