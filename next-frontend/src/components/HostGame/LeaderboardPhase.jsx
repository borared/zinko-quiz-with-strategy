"use client";
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import profileLottieData from '@/lib/settings-profile-lottie.json';

const Lottie = dynamic(() => import('lottie-react').then((mod) => mod.default), { ssr: false });

const TEAM_COLORS = {
  "A": "#27AE60", // Green
  "B": "#E74C3C", // Red
  "C": "#3B68FF", // Blue
  "D": "#FF9F43", // Orange
  "E": "#9B59B6", // Purple
  "F": "#1ABC9C", // Teal
};
const getTeamColor = (teamName) => TEAM_COLORS[teamName] || "#34495e";

const RANK_COLORS = {
  1: "#FFD700", // Gold
  2: "#C0C0C0", // Silver
  3: "#CD7F32", // Bronze
};

const TeamRow = React.memo(({ teamData, index, highestScore }) => {
  const rank = index + 1;
  const isTop3 = rank <= 3;
  const rankColor = RANK_COLORS[rank] || "#95A5A6"; // Default gray for >3
  const teamColor = getTeamColor(teamData.team);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ delay: 0.1 + index * 0.05, type: "spring", stiffness: 200 }}
      className="bg-zk-panel-bg border-[4px] border-zk-border rounded-xl flex items-stretch w-full cursor-default overflow-hidden relative"
    >
      {/* Rank Accent Bar */}
      <div 
        className="w-4 flex-shrink-0 border-r-[4px] border-zk-border"
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

        {/* Team Badge & Crown */}
        <div className="flex-1 flex items-center gap-4 ml-4">
          <div 
            className="text-white font-black text-xl tracking-widest px-6 py-2 rounded-xl border-[4px] border-zk-border"
            style={{ backgroundColor: teamColor }}
          >
            Team {teamData.team}
          </div>
          {teamData.score === highestScore && highestScore > 0 && (
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="-mt-2 ml-1"
            >
              <Lottie 
                animationData={profileLottieData}
                className="w-20 h-20"
                title="Winning Team"
              />
            </motion.div>
          )}
        </div>

        {/* Players Count */}
        <div className="w-32 text-center font-black text-zk-text/40 text-lg flex-shrink-0">
          {teamData.players} {teamData.players === 1 ? 'Player' : 'Players'}
        </div>

        {/* Total Score */}
        <div className="text-4xl w-40 text-right pr-4 tracking-wider gasoek-one-regular" style={{ color: teamColor, WebkitTextStroke: "1.5px #000", textShadow: "2px 2px 0px #000" }}>
          {teamData.score?.toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
});

export default function LeaderboardPhase({ leaderboard, isFinalLeaderboard, handleNextQuestion, handleEndGame }) {
  // Aggregate players by team
  const sortedTeams = useMemo(() => {
    const teamScores = leaderboard.reduce((acc, player) => {
      const teamName = player.team || "Unknown";
      if (!acc[teamName]) {
        acc[teamName] = { team: teamName, score: 0, players: 0 };
      }
      acc[teamName].score += (player.score || 0);
      acc[teamName].players += 1;
      return acc;
    }, {});
    return Object.values(teamScores).sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [leaderboard]);

  const highestScore = sortedTeams.length > 0 ? sortedTeams[0].score : 0;

  return (
    <motion.div
      key="leaderboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative overflow-hidden"
    >
      {/* Transparent background to let HostGameUI scenery show through */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />

      {/* Floating decorations */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-12 w-12 h-12 bg-zk-bg rounded-full border-[3px] border-zk-border z-10"
      />
      <motion.div
        animate={{ y: [6, -6, 6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-16 right-16 w-16 h-16 bg-[#3B68FF] rounded-full border-[3px] border-zk-border z-10"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 right-1/4 w-8 h-8 bg-[#E74C3C] border-[3px] border-zk-border z-10"
      />

      <div className="relative z-20 flex flex-col flex-1 items-center px-6 pt-8 pb-8 h-full max-h-screen">
        {/* Title */}
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-6xl font-black text-white uppercase permanent-marker-regular mb-8 text-center"
          style={{
            WebkitTextStroke: "3px #000",
            textShadow: "4px 4px 0 #000",
          }}
        >
          {isFinalLeaderboard ? "Final Team Rankings" : "Team Leaderboard"}
        </motion.h2>

        {/* Unified Leaderboard Container */}
        <div className="flex-1 w-full max-w-5xl flex flex-col bg-zk-bg border-[4px] border-zk-border rounded-3xl overflow-hidden">
          
          {/* Header Row */}
          <div className="flex items-stretch bg-[#FFCD29] border-b-[4px] border-zk-border">
            <div className="w-4 flex-shrink-0" /> {/* Spacer for accent bar */}
            <div className="flex-1 px-4 py-3 flex items-center gap-4">
              <div className="w-10 text-center font-black text-zk-text/60 uppercase tracking-widest text-sm flex-shrink-0">Rank</div>
              <div className="flex-1 flex items-center ml-4">
                <div className="font-black text-zk-text/60 uppercase tracking-widest text-sm">Team</div>
              </div>
              <div className="w-32 text-center font-black text-zk-text/60 uppercase tracking-widest text-sm flex-shrink-0">Players</div>
              <div className="w-40 text-right font-black text-zk-text/60 uppercase tracking-widest text-sm flex-shrink-0 pr-4">Total Score</div>
            </div>
          </div>

          {/* Team List (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {sortedTeams.map((teamData, i) => (
              <TeamRow
                key={teamData.team || i}
                teamData={teamData}
                index={i}
                highestScore={highestScore}
              />
            ))}
            {sortedTeams.length === 0 && (
              <div className="text-center font-black text-zk-text/50 py-10 uppercase">
                No teams found.
              </div>
            )}
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-center mt-8 flex-shrink-0">
          {!isFinalLeaderboard ? (
            <button
              id="next-after-leaderboard-btn"
              onClick={handleNextQuestion}
              className="bg-[#3B68FF] text-white border-[4px] border-zk-border rounded-xl px-12 py-4 font-black text-xl uppercase tracking-widest transition-all flex items-center gap-3 hover:bg-zk-blue"
            >
              Next Question <ChevronRight size={22} />
            </button>
          ) : (
            <button
              id="end-game-btn"
              onClick={handleEndGame}
              className="bg-[#3B68FF] text-white border-[4px] border-zk-border rounded-xl px-12 py-3 amatic-sc-regular text-4xl uppercase tracking-widest transition-all flex items-center gap-3 hover:bg-zk-blue"
            >
              <Home size={26} /> Home
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
