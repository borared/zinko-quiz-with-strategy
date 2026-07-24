"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { battleBackgroundStyle } from '@/lib/lobbyScenery';

export default function HigherLowerHost({ teamA, teamB, winner, subPhase, currentTurn, background }) {
  // teamA: { guess: 500, status: 'HIGHER', lockedIn: true/false }

  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (subPhase === 'COUNTDOWN') {
      setCountdown(3);
      const timer1 = setTimeout(() => setCountdown(2), 1000);
      const timer2 = setTimeout(() => setCountdown(1), 2000);
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [subPhase]);

  const renderTeamSection = (teamName, data, isWinner) => {
    const isMyTurn = currentTurn === teamName;
    const isGuessingPhase = subPhase === 'GUESS';

    return (
      <div className={`flex flex-col items-center justify-center relative w-full h-full px-8 transition-opacity duration-300 ${isGuessingPhase && !isMyTurn ? 'opacity-30' : 'opacity-100'}`}>
        <h2 className="gasoek-one-regular text-5xl mb-12 text-white tracking-widest relative">
          TEAM {teamName}
          {isGuessingPhase && isMyTurn && (
            <motion.div 
              layoutId="turn-indicator"
              className="absolute -top-10 left-1/2 -translate-x-1/2 text-zk-yellow text-2xl font-bold uppercase tracking-[4px]"
              style={{ fontFamily: 'var(--font-amatic-sc)', whiteSpace: 'nowrap' }}
            >
              YOUR TURN!
            </motion.div>
          )}
        </h2>

        {subPhase === 'PICK' ? (
          <div className="flex flex-col items-center">
             {data.lockedIn ? (
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="text-6xl text-green-400 font-bold tracking-widest uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                 style={{ fontFamily: 'var(--font-amatic-sc)' }}
               >
                 CODE LOCKED IN!
               </motion.div>
             ) : (
               <div className="text-white/50 text-5xl font-bold animate-pulse" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>
                 Setting Secret Code...
               </div>
             )}
          </div>
        ) : (
          /* Guessing Phase */
          data.guess !== null ? (
            <motion.div 
              key={`${teamName}-${data.guess}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="text-[120px] font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" style={{ fontFamily: 'var(--font-amatic-sc)' }}>
                {data.guess}
              </div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`mt-4 px-12 py-4 rounded-full border-[6px] border-black text-4xl font-bold uppercase tracking-widest ${
                  data.status === 'HIGHER' ? 'bg-blue-500 text-white' : 
                  data.status === 'LOWER' ? 'bg-red-500 text-white' : 'bg-gray-500'
                }`}
                style={{ boxShadow: '0 8px 0 0 #000' }}
              >
                {data.status === 'HIGHER' ? 'HIGHER!' : 'LOWER!'}
              </motion.div>
            </motion.div>
          ) : (
            <div className="text-white/30 text-5xl font-bold" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>
              Awaiting Guess...
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-900 overflow-hidden flex flex-col">

      <div className="relative z-10 text-center py-8 mt-4">
         <h1 className="gasoek-one-regular text-zk-yellow text-6xl tracking-wider drop-shadow-lg">
           CODE BREAKER
         </h1>
         <p className="text-white text-4xl mt-4 opacity-90" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>
           {subPhase === 'PICK' ? 'Both teams are setting their Secret Codes! (1 - 99)' : 'Crack the Enemy Code!'}
         </p>
      </div>

      {subPhase === 'INTRO' && (
        <motion.div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-cover bg-center"
          style={battleBackgroundStyle(background)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div
            initial={{ scale: 0.2, y: 100, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="text-center relative z-10"
          >
            <h1 className="gasoek-one-regular text-[150px] text-white tracking-wider" style={{ textShadow: "10px 10px 0 #000" }}>
              HIGHER
            </h1>
            <h1 className="gasoek-one-regular text-[100px] text-white tracking-wider my-[-40px]" style={{ textShadow: "6px 6px 0 #000" }}>
              OR
            </h1>
            <h1 className="gasoek-one-regular text-[150px] text-white tracking-wider" style={{ textShadow: "10px 10px 0 #000" }}>
              LOWER
            </h1>
          </motion.div>
        </motion.div>
      )}

      {subPhase === 'COUNTDOWN' && (
        <motion.div 
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-[250px] text-white gasoek-one-regular"
            style={{ textShadow: "0 10px 0 #000, 0 20px 50px rgba(0,0,0,0.5)" }}
          >
            {countdown}
          </motion.div>
        </motion.div>
      )}

      <div className="flex-1 flex flex-row relative z-10 pb-12">
        {/* Team A Side */}
        <div className="flex-1 border-r-[4px] border-black/30">
          {renderTeamSection("A", teamA, winner === "A")}
        </div>
        {/* Team B Side */}
        <div className="flex-1">
          {renderTeamSection("B", teamB, winner === "B")}
        </div>
      </div>

      {/* Global Winner Overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-zk-yellow px-20 py-12 rounded-3xl border-[8px] border-black shadow-[0_12px_0_0_#000] rotate-[2deg] flex flex-col items-center"
            >
              <h1 className="gasoek-one-regular text-7xl md:text-9xl text-white uppercase" style={{ textShadow: "6px 6px 0 #000" }}>
                TEAM {winner} WINS!
              </h1>
              <p className="font-bold text-5xl mt-6 text-black" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '4px' }}>
                Code Cracked!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
