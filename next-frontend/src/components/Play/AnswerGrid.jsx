"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoxSmokescreen from './Skills/FoxSmokescreen';

const ANSWER_BUTTONS = [
  { shape: '▲', bg: 'bg-[#E74C3C]', activeBg: 'bg-[#C0392B]', border: 'border-[#C0392B]', shadow: '#C0392B' },
  { shape: '◆', bg: 'bg-[#3B68FF]', activeBg: 'bg-[#2850CC]', border: 'border-[#2850CC]', shadow: '#2850CC' },
  { shape: '●', bg: 'bg-[#F39C12]', activeBg: 'bg-[#D68910]', border: 'border-[#D68910]', shadow: '#D68910' },
  { shape: '■', bg: 'bg-[#27AE60]', activeBg: 'bg-[#1E8449]', border: 'border-[#1E8449]', shadow: '#1E8449' },
];

export default function AnswerGrid({ 
  question, 
  phase, 
  selectedId, 
  removedAnswers, 
  foxSmokescreen, 
  handleAnswer 
}) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 pb-8 relative">
      <FoxSmokescreen isActive={foxSmokescreen} />

      {question?.answers?.map((answer, i) => {
        const btn = ANSWER_BUTTONS[i] || ANSWER_BUTTONS[0];
        const isSelected = selectedId === answer.id;
        const isRemoved = removedAnswers.includes(answer.id);
        const isDisabled = phase !== 'PLAYING' || isRemoved || foxSmokescreen;

        return (
          <motion.button
            key={answer.id}
            id={`answer-btn-${answer.id}`}
            whileTap={!isDisabled ? { scale: 0.94 } : {}}
            onClick={() => handleAnswer(answer.id)}
            disabled={isDisabled}
            className={`
              relative rounded-3xl px-4 py-6 flex flex-col items-center justify-center gap-3
              border-b-4 transition-all duration-150 min-h-[140px]
              ${isSelected
                ? `${btn.activeBg} ${btn.border} shadow-none translate-y-1 opacity-100`
                : isDisabled
                  ? `${btn.bg} ${btn.border} opacity-20 cursor-not-allowed filter grayscale`
                  : `${btn.bg} ${btn.border} shadow-[0_6px_0_0_${btn.shadow}] active:translate-y-[3px] active:shadow-[0_3px_0_0_${btn.shadow}]`
              }
            `}
          >
            <span className="text-white text-3xl font-black opacity-80">{btn.shape}</span>
            <span className="text-white font-black text-sm text-center leading-tight">{answer.text}</span>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-xs">✓</span>
              </motion.div>
            )}
          </motion.button>
        );
      })}

      {/* Skeleton if no question yet */}
      {!question?.answers && [0, 1, 2, 3].map(i => (
        <div key={i} className={`rounded-3xl min-h-[140px] ${ANSWER_BUTTONS[i].bg} opacity-20 animate-pulse`} />
      ))}
    </div>
  );
}
