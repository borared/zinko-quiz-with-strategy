"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSkillConfig } from '../../config/skills';

export default function QuestionPrompt({ 
  phase, 
  question, 
  selectedId, 
  playerSkill, 
  isSkillLockedOut, 
  skillLockoutMsg, 
  skillChargesLeft, 
  foxSmokescreen, 
  handleUseSkill 
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4 mt-2">
      {phase === 'PLAYING' && !selectedId && question && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white rounded-2xl p-5 border-[4px] border-zk-black shadow-[6px_6px_0_#000] text-center"
        >
          <p className="text-zk-black font-black text-xl lg:text-2xl leading-tight uppercase">
            {question.questionText}
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'PLAYING' && !selectedId && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {playerSkill ? (
              (() => {
                const config = getSkillConfig(playerSkill);
                const Icon = config.icon;
                const isInactive = isSkillLockedOut || skillChargesLeft <= 0 || foxSmokescreen;
                return (
                  <button 
                    onClick={handleUseSkill}
                    disabled={isInactive}
                    className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-black uppercase border-b-4 text-xl tracking-widest transition-transform mx-auto ${
                      isInactive
                        ? 'bg-gray-700 border-gray-900 text-white/50 cursor-not-allowed'
                        : `${config.buttonColor} ${config.buttonBorder} text-white active:translate-y-1 active:border-b-0 hover:scale-105`
                    }`}
                    style={(!isInactive) ? { boxShadow: `0 0 20px ${config.buttonShadow}` } : {}}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{isSkillLockedOut ? skillLockoutMsg : `USE ${config.name.toUpperCase()} (${skillChargesLeft})`}</span>
                  </button>
                );
              })()
            ) : (
              <p className="text-white/30 text-sm font-bold uppercase tracking-[0.2em]">
                Tap your answer below 👇
              </p>
            )}
          </motion.div>
        )}

        {phase === 'ANSWERED' && (
          <motion.div
            key="answered"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="text-5xl mb-3">⏳</div>
            <p className="text-white font-black text-xl">Answer locked in!</p>
            <p className="text-white/40 text-sm mt-1 uppercase tracking-widest">Waiting for results...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
