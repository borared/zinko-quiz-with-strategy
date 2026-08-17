"use client";
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import profileLottieData from '@/lib/settings-profile-lottie.json';

const Lottie = dynamic(() => import('lottie-react').then((mod) => mod.default), { ssr: false });

const RANK_COLORS = {
  1: "#FFD700", // Gold
  2: "#27AE60", // Green
  3: "#CD7F32", // Bronze
};

const PlayerRow = React.memo(({ player, index, highestScore }) => {
  const rank = index + 1;
  const isTop3 = rank <= 3;
  const rankColor = RANK_COLORS[rank] || "#95A5A6";

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.05, type: "spring", stiffness: 200 }}
      className="bg-zk-panel-bg border-[2px] border-zk-border rounded-lg flex items-stretch w-full cursor-default overflow-hidden relative"
    >
      {/* Rank Accent Bar */}
      <div 
        className="w-4 flex-shrink-0 border-r-[2px] border-zk-border"
        style={{ backgroundColor: rankColor }}
      />
      
      {/* Content Container */}
      <div className="flex-1 px-4 py-3 flex items-center gap-4">
        {/* Rank Number */}
        <div 
          className="font-black text-2xl w-10 text-center flex-shrink-0"
          style={{ color: isTop3 ? rankColor : "#95A5A6", WebkitTextStroke: isTop3 ? "1px #000" : "none" }}
        >
          {rank}
        </div>

        {/* Player Info */}
        <div className="flex-1 flex items-center gap-4 ml-4">
          <div className="flex items-center gap-3">
            {player.avatar && (
              <img src={player.avatar} alt={player.nickname} className="w-10 h-10 rounded-full border-2 border-black" />
            )}
            <div className="text-black font-black text-xl tracking-widest uppercase">
              {player.nickname}
            </div>
          </div>
          {player.score === highestScore && highestScore > 0 && (
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="-mt-2 ml-1"
            >
              <Lottie 
                animationData={profileLottieData}
                className="w-20 h-20"
                title="Winning Player"
              />
            </motion.div>
          )}
        </div>

        {/* Total Score */}
        <div className="text-4xl w-40 text-right pr-4 tracking-wider gasoek-one-regular text-[#27AE60]" style={{ WebkitTextStroke: "1.5px #000", textShadow: "2px 2px 0px #000" }}>
          {player.score?.toLocaleString() || 0}
        </div>
      </div>
    </motion.div>
  );
});

export default function IndividualLeaderboardPhase({ leaderboard, isFinalLeaderboard, handleNextQuestion, handleEndGame, isPlayerView = false }) {
  const sortedPlayers = useMemo(() => {
    return [...leaderboard].sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [leaderboard]);

  const highestScore = sortedPlayers.length > 0 ? sortedPlayers[0].score : 0;

  return (
    <motion.div
      key="individual-leaderboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />

      {/* Floating decorations */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-12 w-12 h-12 bg-zk-bg rounded-full border-[3px] border-zk-border z-10 hidden md:block"
      />
      <motion.div
        animate={{ y: [6, -6, 6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-16 right-16 w-16 h-16 bg-[#3B68FF] rounded-full border-[3px] border-zk-border z-10 hidden md:block"
      />

      <div className="relative z-20 flex flex-col flex-1 items-center px-4 md:px-6 pt-8 pb-8 h-full max-h-[100dvh]">
        {/* Title */}
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl font-black text-white uppercase permanent-marker-regular mb-6 text-center"
          style={{
            WebkitTextStroke: "2px #000",
            textShadow: "3px 3px 0 #000",
          }}
        >
          {isFinalLeaderboard ? "Final Rankings" : "Leaderboard"}
        </motion.h2>

        {/* Unified Leaderboard Container */}
        <div className="flex-1 w-full max-w-5xl flex flex-col bg-zk-bg border-[2px] border-zk-border rounded-lg overflow-hidden">
          
          {/* Header Row */}
          <div className="flex items-stretch bg-[#FFCD29] border-b-[2px] border-zk-border px-[14px] md:px-[22px]">
            <div className="w-4 flex-shrink-0 border-r-[2px] border-transparent" />
            <div className="flex-1 px-4 py-3 flex items-center gap-4">
              <div className="w-10 text-center font-black text-black uppercase tracking-widest text-xs md:text-sm flex-shrink-0">Rank</div>
              <div className="flex-1 flex items-center ml-4">
                <div className="font-black text-black uppercase tracking-widest text-xs md:text-sm">Player</div>
              </div>
              <div className="w-24 md:w-40 text-right font-black text-black uppercase tracking-widest text-xs md:text-sm flex-shrink-0 pr-4">Score</div>
            </div>
          </div>

          {/* Player List (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {sortedPlayers.map((player, i) => (
              <PlayerRow
                key={player.id || i}
                player={player}
                index={i}
                highestScore={highestScore}
              />
            ))}
            {sortedPlayers.length === 0 && (
              <div className="text-center font-black text-zk-text/50 py-10 uppercase">
                No players found.
              </div>
            )}
          </div>
        </div>

        {/* Bottom buttons (Only for Host) */}
        {!isPlayerView && (
          <div className="flex justify-center mt-6 flex-shrink-0">
            {!isFinalLeaderboard ? (
              <button
                id="next-after-leaderboard-btn"
                onClick={handleNextQuestion}
                className="bg-[#3B68FF] text-white border-[2px] border-zk-border rounded-lg px-8 py-3 md:px-12 md:py-4 font-black text-lg md:text-xl tracking-widest transition-all flex items-center gap-3 hover:bg-zk-blue"
              >
                Next Question <ChevronRight size={22} />
              </button>
            ) : (
              <button
                id="end-game-btn"
                onClick={handleEndGame}
                className="bg-[#3B68FF] text-white border-[2px] border-zk-border rounded-lg px-8 py-2 md:px-12 md:py-3 amatic-sc-regular text-3xl md:text-4xl tracking-widest transition-all flex items-center gap-3 hover:bg-zk-blue"
              >
                <Home size={26} /> Home
              </button>
            )}
          </div>
        )}
        
        {/* Footer for Player View */}
        {isPlayerView && (
          <div className="flex justify-center mt-6 flex-shrink-0">
             {!isFinalLeaderboard ? (
               <div className="text-white/80 font-black tracking-widest uppercase animate-pulse">
                  Waiting for Host...
               </div>
             ) : (
               <button
                 id="player-end-game-btn"
                 onClick={() => {
                   if (handleEndGame) {
                     handleEndGame();
                   } else {
                     window.location.href = '/';
                   }
                 }}
                 className="bg-[#3B68FF] text-white border-[2px] border-zk-border rounded-lg px-8 py-2 md:px-12 md:py-3 amatic-sc-regular text-3xl md:text-4xl tracking-widest transition-all flex items-center gap-3 hover:bg-zk-blue"
               >
                 <Home size={26} /> Home
               </button>
             )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
