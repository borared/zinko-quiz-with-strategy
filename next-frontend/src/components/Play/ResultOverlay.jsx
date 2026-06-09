"use client";
import React from 'react';
import { motion } from 'framer-motion';
import FrogSteal from './Skills/FrogSteal';

export default function ResultOverlay({ resultData }) {
  if (!resultData) return null;

  const hasStolenPoints = resultData.stolenPoints !== 0 && resultData.stolenPoints !== undefined;

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex flex-col items-center justify-center px-6 relative">
      <FrogSteal isActive={hasStolenPoints} />
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className="text-center"
      >
        <div className="text-8xl mb-6">
          {resultData.isCorrect ? '✅' : '❌'}
        </div>
        <h2 className={`text-4xl font-black mb-2 ${resultData.isCorrect ? 'text-[#27AE60]' : 'text-[#E74C3C]'}`}>
          {resultData.isCorrect ? 'Correct!' : 'Incorrect'}
        </h2>
        
        {resultData.isCorrect && (
          <div className="flex flex-col items-center">
            {resultData.rabbitBonusApplied && (
              <motion.span 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="bg-[#F39C12] text-black text-xs font-black px-2 py-1 rounded mb-1 uppercase tracking-widest"
              >
                Rabbit Bonus 2x!
              </motion.span>
            )}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[#FFCD29] font-black text-4xl mb-1"
            >
              +{resultData.pointsEarned?.toLocaleString()}
            </motion.p>
          </div>
        )}

        {/* Frog Stolen Points UI */}
        {resultData.stolenPoints !== 0 && resultData.stolenPoints !== undefined && (
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
            className={`mt-4 px-4 py-2 rounded-xl border-2 font-black tracking-wider ${
              resultData.stolenPoints > 0 
                ? 'bg-[#27AE60]/20 border-[#27AE60] text-[#27AE60]'
                : 'bg-[#E74C3C]/20 border-[#E74C3C] text-[#E74C3C]'
            }`}
          >
            {resultData.stolenPoints > 0 ? (
              <>🐸 Stole +{resultData.stolenPoints.toLocaleString()} pts!</>
            ) : (
              <>👅 Enemy Frog stole {Math.abs(resultData.stolenPoints).toLocaleString()} pts!</>
            )}
          </motion.div>
        )}

        <p className="text-white/50 text-lg font-bold mt-4">
          Total: <span className="text-white">{resultData.totalScore?.toLocaleString()}</span>
        </p>

        <div className="mt-8 flex items-center gap-2 text-white/30 justify-center">
          <div className="w-2 h-2 rounded-full bg-[#FFCD29] animate-pulse" />
          <p className="text-sm uppercase tracking-widest font-bold">Next question coming up...</p>
        </div>
      </motion.div>
    </div>
  );
}
