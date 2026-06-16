"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoxSmokescreen from './Skills/FoxSmokescreen';

const ANSWER_BUTTONS = [
  { shape: '▲', bg: 'bg-[#E74C3C]', activeBg: 'bg-[#C0392B]' },
  { shape: '◆', bg: 'bg-[#3B68FF]', activeBg: 'bg-[#2850CC]' },
  { shape: '●', bg: 'bg-[#F39C12]', activeBg: 'bg-[#D68910]' },
  { shape: '■', bg: 'bg-[#27AE60]', activeBg: 'bg-[#1E8449]' },
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
              border-[4px] border-zk-black transition-all duration-150 min-h-[140px]
              ${isSelected
                ? `${btn.activeBg} shadow-none translate-y-[6px] translate-x-[6px] opacity-100`
                : isDisabled
                  ? `${btn.bg} opacity-20 cursor-not-allowed filter grayscale`
                  : `${btn.bg} shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:brightness-110`
              }
            `}
          >
            <span className="text-white text-3xl font-black opacity-80">{btn.shape}</span>
            <span className="text-zk-black font-black text-xl md:text-2xl text-center leading-tight">{answer.text}</span>
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
