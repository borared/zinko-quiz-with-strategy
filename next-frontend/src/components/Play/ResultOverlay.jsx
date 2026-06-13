"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import FrogSteal from './Skills/FrogSteal';

export default function ResultOverlay({ resultData }) {
  if (!resultData) return null;

  const hasStolenPoints = resultData.stolenPoints !== 0 && resultData.stolenPoints !== undefined;

  const isCorrect = resultData.isCorrect;
  const bgColor = isCorrect ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans`}>
      <FrogSteal isActive={hasStolenPoints} />
      
      {/* Decorative spinning rays */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: 'repeating-conic-gradient(from 0deg, transparent 0deg 15deg, white 15deg 30deg)',
          animation: 'spin 40s linear infinite'
        }} 
      />

      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="text-center z-10 w-full max-w-sm flex flex-col items-center"
      >
        <div className="mb-2">
          {isCorrect ? (
            <Check size={120} strokeWidth={4} className="text-white drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)]" />
          ) : (
            <X size={120} strokeWidth={4} className="text-white drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)]" />
          )}
        </div>
        
        <h2 className="text-[5rem] leading-none gasoek-one-regular mb-6 text-white uppercase tracking-wider drop-shadow-[0_8px_0_rgba(0,0,0,0.8)]">
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </h2>
          
        {isCorrect && (
          <div className="flex flex-col items-center mb-6 w-full">
            {resultData.rabbitBonusApplied && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="bg-zk-yellow border-[3px] border-zk-black text-black text-sm font-zk-bold px-4 py-2 rounded-xl mb-3 uppercase tracking-widest shadow-[0_4px_0_0_rgba(0,0,0,1)]"
              >
                🐰 Rabbit Bonus 2x!
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="bg-white border-[4px] border-zk-black rounded-2xl px-8 py-3 shadow-[0_6px_0_0_rgba(0,0,0,1)]"
            >
              <p className="text-zk-black font-zk-bold text-4xl">
                +{resultData.pointsEarned?.toLocaleString()}
              </p>
            </motion.div>
          </div>
        )}

        {/* Frog Stolen Points UI */}
        {resultData.stolenPoints !== 0 && resultData.stolenPoints !== undefined && (
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
            className={`mb-6 px-6 py-3 rounded-2xl border-[4px] border-zk-black shadow-[0_6px_0_0_rgba(0,0,0,1)] font-zk-bold text-xl tracking-wide ${
              resultData.stolenPoints > 0 
                ? 'bg-zk-yellow text-zk-black'
                : 'bg-black text-white'
            }`}
          >
            {resultData.stolenPoints > 0 ? (
              <>🐸 Stole +{resultData.stolenPoints.toLocaleString()} pts!</>
            ) : (
              <>👅 Frog stole {Math.abs(resultData.stolenPoints).toLocaleString()} pts!</>
            )}
          </motion.div>
        )}

        <div className="mt-2 bg-black/60 backdrop-blur-sm rounded-full px-6 py-2 inline-block shadow-md">
          <p className="text-white/90 text-lg font-zk-medium tracking-wide">
            Total Score: <span className="text-zk-yellow font-zk-bold text-xl ml-1">{resultData.totalScore?.toLocaleString()}</span>
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <p className="text-white/80 text-xs uppercase tracking-widest font-zk-bold drop-shadow-md">Next question coming up...</p>
        </div>
      </motion.div>
    </div>
  );
}
