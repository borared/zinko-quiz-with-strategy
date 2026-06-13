"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_MAP = {
  RED: "#EF4444",
  BLUE: "#3B82F6",
  GREEN: "#22C55E",
  YELLOW: "#EAB308",
};

export default function VaultBreakerHost({ teamVaults, heldColors, vaultsToWin, winner }) {
  // teamVaults: { A: { required: ['RED','BLUE'], cracked: 0 }, B: ... }
  // heldColors: { A: ['RED'], B: [] }

  const [crackedAnimation, setCrackedAnimation] = useState({ A: false, B: false });

  // Monitor cracked count to trigger animations
  useEffect(() => {
    if (teamVaults.A.cracked > 0) {
      setCrackedAnimation(p => ({ ...p, A: true }));
      setTimeout(() => setCrackedAnimation(p => ({ ...p, A: false })), 1000);
    }
  }, [teamVaults.A.cracked]);

  useEffect(() => {
    if (teamVaults.B.cracked > 0) {
      setCrackedAnimation(p => ({ ...p, B: true }));
      setTimeout(() => setCrackedAnimation(p => ({ ...p, B: false })), 1000);
    }
  }, [teamVaults.B.cracked]);

  const renderVault = (teamName, teamData, heldList, isWinner, isCracking) => {
    const { required, cracked } = teamData;
    const progress = Math.min(cracked, vaultsToWin);
    const progressPerc = (progress / vaultsToWin) * 100;
    
    // Check if team is holding right combinations to shake the vault
    const correctHeld = required.filter(c => heldList.includes(c)).length;
    const shakeIntensity = correctHeld === required.length ? 0 : correctHeld > 0 ? correctHeld * 2 : 0;

    return (
      <div className="flex flex-col items-center justify-center relative w-full h-full px-8">
        
        {/* Team Header */}
        <h2 className="gasoek-one-regular text-5xl mb-6 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          TEAM {teamName}
        </h2>

        {/* Indicator Lights (The combination lock) */}
        <div className="flex gap-4 mb-8">
          {required.map((color, idx) => {
            const isHeld = heldList.includes(color);
            return (
              <motion.div
                key={`${teamName}-${cracked}-${idx}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full border-[4px] border-black shadow-[0_4px_0_0_#000]"
                style={{
                  backgroundColor: COLOR_MAP[color],
                  opacity: isHeld ? 1 : 0.4,
                  boxShadow: isHeld ? `0 0 25px ${COLOR_MAP[color]}, 0 4px 0 0 #000` : "0 4px 0 0 #000",
                  transform: isHeld ? "scale(1.1)" : "scale(1)",
                  transition: "opacity 0.15s, box-shadow 0.15s, transform 0.15s"
                }}
              />
            );
          })}
        </div>

        {/* The Vault Graphic */}
        <motion.div 
          className="relative w-64 h-64 md:w-80 md:h-80 bg-[#cbd5e1] rounded-3xl border-[8px] border-black shadow-[0_12px_0_0_#000] flex items-center justify-center overflow-hidden"
          animate={{
            x: shakeIntensity ? [0, -shakeIntensity, shakeIntensity, -shakeIntensity, 0] : 0,
            y: shakeIntensity ? [0, shakeIntensity, -shakeIntensity, shakeIntensity, 0] : 0,
            scale: isCracking ? [1, 1.1, 0.9, 1.2, 1] : 1,
            rotate: isCracking ? [0, -5, 5, -5, 0] : 0,
          }}
          transition={{
            duration: isCracking ? 0.6 : 0.2,
            repeat: shakeIntensity && !isCracking ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {/* Inner Vault Door detailing */}
          <div className="absolute inset-4 border-[4px] border-slate-500 rounded-2xl pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full border-[6px] border-black bg-slate-400 flex items-center justify-center">
             <div className="w-8 h-8 rounded-full bg-black" />
          </div>
          {/* Handle bars */}
          <div className="absolute w-48 h-4 bg-black rotate-45" />
          <div className="absolute w-48 h-4 bg-black -rotate-45" />

          {/* Cracked Success Flash */}
          <AnimatePresence>
            {isCracking && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white z-10"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Progress Bar below vault */}
        <div className="mt-12 w-full max-w-sm h-10 border-[4px] border-black bg-slate-800 rounded-full overflow-hidden relative">
           <motion.div 
             className="h-full bg-zk-green"
             initial={{ width: 0 }}
             animate={{ width: `${progressPerc}%` }}
             transition={{ type: "spring", stiffness: 50 }}
           />
           <div className="absolute inset-0 flex items-center justify-center font-zk-bold text-white text-xl drop-shadow-md">
             {progress} / {vaultsToWin}
           </div>
        </div>

        {/* Winner Overlay */}
        {isWinner && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-zk-yellow px-12 py-6 rounded-3xl border-[6px] border-black shadow-[0_8px_0_0_#000] rotate-[-5deg]">
              <h1 className="gasoek-one-regular text-6xl text-black">VAULT CRACKED!</h1>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-900 overflow-hidden flex flex-col">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 2px, transparent 2px)",
          backgroundSize: "40px 40px"
        }}
      />

      <div className="relative z-10 text-center py-8">
         <h1 className="gasoek-one-regular text-zk-yellow text-5xl md:text-6xl drop-shadow-[0_4px_0_#000]">
           SYNCHRONIZATION OVERLOAD
         </h1>
         <p className="font-zk-bold text-white text-2xl mt-4">
           Hold the right combination to crack the vaults!
         </p>
      </div>

      <div className="flex-1 flex flex-row relative z-10 pb-12">
        {/* Team A Side */}
        <div className="flex-1 border-r-[4px] border-black/30">
          {renderVault("A", teamVaults.A, heldColors.A, winner === "A", crackedAnimation.A)}
        </div>
        {/* Team B Side */}
        <div className="flex-1">
          {renderVault("B", teamVaults.B, heldColors.B, winner === "B", crackedAnimation.B)}
        </div>
      </div>
    </div>
  );
}
