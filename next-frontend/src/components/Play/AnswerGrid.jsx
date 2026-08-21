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
  removedAnswers = [],
  foxSmokescreen,
  isLeader,
  teamCounterBlindCharges,
  onCounterBlind,
  handleAnswer,
}) {
  const isTrueFalse = isTrueFalseQuestion(question?.questionType);
  const answers = question?.answers || [];
  const skeletonCount = isTrueFalse ? 2 : 4;

  return (
    <div className={`grid gap-3 p-4 pb-8 relative w-full ${isTrueFalse ? 'grid-cols-2' : 'grid-cols-2'}`}>
      <FoxSmokescreen 
        isActive={foxSmokescreen} 
        isLeader={isLeader}
        teamCounterBlindCharges={teamCounterBlindCharges}
        onCounterBlind={onCounterBlind}
      />

      {answers.map((answer, i) => {
        const style = getAnswerStyle(answer, i, isTrueFalse);
        const isSelected = selectedId === answer.id;
        const isRemoved = removedAnswers.includes(answer.id);
        const isDisabled = phase !== 'PLAYING' || isRemoved;
        const label = displayAnswerText(answer.text);

        return (
          <motion.button
            key={answer.id}
            id={`answer-btn-${answer.id}`}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            onClick={() => handleAnswer(answer.id)}
            disabled={isDisabled}
            className={`
              relative rounded-lg px-5 py-4 flex items-center gap-4
              border-2 border-zk-border transition-all duration-150 w-full text-left
              ${isSelected
                ? `${style.activeBg} opacity-100`
                : isDisabled
                  ? `${style.bg} opacity-20 cursor-not-allowed filter grayscale`
                  : `${style.bg} hover:brightness-105`
              }
            `}
          >
            {!isTrueFalse && (
              <div className="w-10 h-10 bg-zk-panel-bg/30 rounded-lg flex items-center justify-center border-2 border-black/10 flex-shrink-0">
                <span className="text-white text-2xl font-black opacity-90">{style.shape}</span>
              </div>
            )}
            <span className={`font-black flex-1 leading-snug text-white text-lg md:text-xl ${isTrueFalse ? 'text-center font-black text-2xl md:text-3xl' : ''}`}>
              {label}
            </span>
            {!isTrueFalse && (
              isSelected ? (
                <div className="w-8 h-8 rounded-full bg-zk-panel-bg/30 flex items-center justify-center border-2 border-white/50 flex-shrink-0">
                  <span className="text-white text-sm font-black">✓</span>
                </div>
              ) : (
                <div
                  className="w-8 h-8 rounded-full border-2 flex-shrink-0"
                  style={{ borderColor: "rgba(255,255,255,0.3)" }}
                />
              )
            )}
          </motion.button>
        );
      })}

      {!question?.answers && Array.from({ length: skeletonCount }).map((_, i) => (
        <div
          key={i}
          className={`rounded-lg h-[72px] ${(MC_ANSWER_BUTTONS[i] || MC_ANSWER_BUTTONS[0]).bg} opacity-20 animate-pulse`}
        />
      ))}
    </div>
  );
}