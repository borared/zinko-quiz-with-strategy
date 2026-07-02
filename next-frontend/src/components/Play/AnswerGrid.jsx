"use client";
import React from 'react';
import { motion } from 'framer-motion';
import FoxSmokescreen from './Skills/FoxSmokescreen';
import { displayAnswerText, isTrueFalseQuestion } from '@/lib/questionTypes';

const MC_ANSWER_BUTTONS = [
  { shape: '▲', bg: 'bg-[#E74C3C]', activeBg: 'bg-[#C0392B]' },
  { shape: '◆', bg: 'bg-[#3B68FF]', activeBg: 'bg-[#2850CC]' },
  { shape: '●', bg: 'bg-[#F39C12]', activeBg: 'bg-[#D68910]' },
  { shape: '■', bg: 'bg-[#27AE60]', activeBg: 'bg-[#1E8449]' },
];

const TF_ANSWER_STYLES = {
  true: { bg: 'bg-[#2ea84a]', activeBg: 'bg-[#248a3d]' },
  false: { bg: 'bg-[#FF4B4B]', activeBg: 'bg-[#d93f3f]' },
};

function getTrueFalseStyle(answer) {
  const label = displayAnswerText(answer.text).toLowerCase();
  return TF_ANSWER_STYLES[label] || TF_ANSWER_STYLES.true;
}

function getAnswerStyle(answer, index, isTrueFalse) {
  if (isTrueFalse) {
    return getTrueFalseStyle(answer);
  }
  return MC_ANSWER_BUTTONS[index] || MC_ANSWER_BUTTONS[0];
}

export default function AnswerGrid({
  question,
  phase,
  selectedId,
  removedAnswers,
  foxSmokescreen,
  handleAnswer,
}) {
  const isTrueFalse = isTrueFalseQuestion(question?.questionType);
  const answers = question?.answers || [];
  const skeletonCount = isTrueFalse ? 2 : 4;

  return (
    <div className={`grid gap-3 p-4 pb-8 relative w-full ${isTrueFalse ? 'grid-cols-2' : 'grid-cols-2'}`}>
      <FoxSmokescreen isActive={foxSmokescreen} />

      {answers.map((answer, i) => {
        const style = getAnswerStyle(answer, i, isTrueFalse);
        const isSelected = selectedId === answer.id;
        const isRemoved = removedAnswers.includes(answer.id);
        const isDisabled = phase !== 'PLAYING' || isRemoved || foxSmokescreen;
        const label = displayAnswerText(answer.text);

        return (
          <motion.button
            key={answer.id}
            id={`answer-btn-${answer.id}`}
            whileTap={!isDisabled ? { scale: 0.94 } : {}}
            onClick={() => handleAnswer(answer.id)}
            disabled={isDisabled}
            className={`
              relative rounded-3xl px-4 py-6 flex flex-col items-center justify-center gap-3
              border-[4px] border-zk-black transition-all duration-150 min-h-[140px] w-full
              ${isSelected
                ? `${style.activeBg} shadow-none translate-y-[6px] translate-x-[6px] opacity-100`
                : isDisabled
                  ? `${style.bg} opacity-20 cursor-not-allowed filter grayscale`
                  : `${style.bg} shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:brightness-110`
              }
            `}
          >
            {!isTrueFalse && (
              <span className="text-white text-3xl font-black opacity-80">{style.shape}</span>
            )}
            <span className={`font-black text-center leading-tight uppercase ${isTrueFalse ? 'text-white text-2xl md:text-3xl' : 'text-zk-black text-xl md:text-2xl'}`}>
              {label}
            </span>
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

      {!question?.answers && Array.from({ length: skeletonCount }).map((_, i) => (
        <div
          key={i}
          className={`rounded-3xl min-h-[140px] ${(MC_ANSWER_BUTTONS[i] || MC_ANSWER_BUTTONS[0]).bg} opacity-20 animate-pulse`}
        />
      ))}
    </div>
  );
}