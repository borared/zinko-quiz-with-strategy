"use client";
import React from 'react';
import { motion } from 'framer-motion';
import FrogSteal from './Skills/FrogSteal';

const RESULT_VARIANTS = {
  correct: {
    bgColor: 'bg-green-600',
    imageSrc: '/images/model_answer/right.png',
    title: 'Correct!',
    titleClass: 'text-[5rem] md:text-[6rem]',
    showPoints: true,
  },
  incorrect: {
    bgColor: 'bg-red-500',
    imageSrc: '/images/model_answer/wrong.png',
    title: 'Incorrect',
    titleClass: 'text-[5rem] md:text-[6rem]',
    showPoints: false,
  },
  missed: {
    bgColor: 'bg-orange-500',
    imageSrc: '/images/model_answer/miss_answer.png',
    title: 'OOPS you missed',
    titleClass: 'text-[3.5rem] md:text-[4.5rem] whitespace-nowrap',
    showPoints: false,
  },
};

function getResultVariant(resultData) {
  if (resultData.isMissed) return 'missed';
  if (resultData.isCorrect) return 'correct';
  return 'incorrect';
}

export default function ResultOverlay({ resultData }) {
  if (!resultData) return null;

  const hasStolenPoints = resultData.stolenPoints !== 0 && resultData.stolenPoints !== undefined;
  const variant = RESULT_VARIANTS[getResultVariant(resultData)];
  const { bgColor, imageSrc, title, titleClass, showPoints } = variant;

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans`}>
      <FrogSteal isActive={hasStolenPoints} />

      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="text-center z-10 w-full max-w-sm flex flex-col items-center"
      >
        <div className="mb-2">
          <motion.img 
            src={imageSrc} 
            alt={title} 
            className="h-56 md:h-72 object-contain" 
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />
        </div>
        
        <h2 className={`${titleClass} leading-none gasoek-one-regular mb-6 text-white tracking-wider`}>
          {title}
        </h2>
          
        {showPoints && (
          <div className="flex flex-col items-center mb-6 w-full">

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="bg-white border-[4px] border-zk-black rounded-2xl px-8 py-3"
            >
              <p className="text-zk-black font-black text-5xl md:text-6xl tracking-widest gasoek-one-regular">
                +{resultData.pointsEarned?.toLocaleString()}
              </p>
            </motion.div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-md" />
          <p 
            className="text-white/90 text-3xl font-bold drop-shadow-md"
            style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
          >
            Next question coming up...
          </p>
        </div>
      </motion.div>

      {/* Zinko Style Total Score at Bottom Left */}
      <motion.div 
        initial={{ x: -50, opacity: 0, rotate: -3 }}
        animate={{ x: 0, opacity: 1, rotate: -3, y: [0, -8, 0] }}
        transition={{ 
          x: { type: 'spring', stiffness: 200 },
          opacity: { duration: 0.5 },
          y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } 
        }}
        className="absolute bottom-6 left-6 z-20 bg-white text-zk-black border-[4px] border-zk-black rounded-xl px-6 py-2 font-['Outfit'] tracking-wide"
      >
        <p className="font-bold text-xl md:text-2xl">
          Total Score: <span className="text-zk-blue ml-2 font-black text-2xl md:text-3xl">{resultData.totalScore?.toLocaleString()}</span>
        </p>
      </motion.div>

      {/* Status Tags at Bottom Right */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-4">
        {/* Bonus Points UI */}
        {resultData.bonusPointsApplied && (
          <motion.div
            initial={{ x: 50, opacity: 0, rotate: 2 }} 
            animate={{ x: 0, opacity: 1, rotate: 2, y: [0, -8, 0] }} 
            transition={{ 
              x: { delay: 0.5, type: 'spring', stiffness: 200 },
              opacity: { delay: 0.5, duration: 0.5 },
              y: { repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.5 }
            }}
            className="px-6 py-2 rounded-xl border-[4px] border-zk-black font-bold text-xl md:text-2xl bg-zk-yellow text-zk-black font-['Outfit'] tracking-wide"
          >
            +20% Points!
          </motion.div>
        )}

        {/* Rabbit Bonus UI */}
        {resultData.rabbitBonusApplied && (
          <motion.div
            initial={{ x: 50, opacity: 0, rotate: 2 }} 
            animate={{ x: 0, opacity: 1, rotate: 2, y: [0, -8, 0] }} 
            transition={{ 
              x: { delay: 0.4, type: 'spring', stiffness: 200 },
              opacity: { delay: 0.4, duration: 0.5 },
              y: { repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.4 }
            }}
            className="px-6 py-2 rounded-xl border-[4px] border-zk-black font-bold text-xl md:text-2xl bg-zk-yellow text-zk-black font-['Outfit'] tracking-wide"
          >
            Rabbit Bonus 2x!
          </motion.div>
        )}

        {/* Frog Stolen Points UI */}
        {resultData.stolenPoints !== 0 && resultData.stolenPoints !== undefined && (
          <motion.div
            initial={{ x: 50, opacity: 0, rotate: 2 }} 
            animate={{ x: 0, opacity: 1, rotate: 2, y: [0, -8, 0] }} 
            transition={{ 
              x: { delay: 0.6, type: 'spring', stiffness: 200 },
              opacity: { delay: 0.6, duration: 0.5 },
              y: { repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.6 }
            }}
            className={`px-6 py-2 rounded-xl border-[4px] border-zk-black font-bold text-xl md:text-2xl font-['Outfit'] tracking-wide ${
              resultData.stolenPoints > 0 
                ? 'bg-zk-yellow text-zk-black'
                : 'bg-black text-white border-white'
            }`}
          >
            {resultData.stolenPoints > 0 ? (
              <>Stole +{resultData.stolenPoints.toLocaleString()} pts!</>
            ) : (
              <>Stolen -{Math.abs(resultData.stolenPoints).toLocaleString()} pts!</>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
