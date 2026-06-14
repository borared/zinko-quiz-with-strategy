"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSkillConfig } from '../../config/skills';
import { Lock } from 'lucide-react';

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
                    className={`flex items-center justify-center gap-3 px-8 py-3 rounded-full font-black uppercase border-[4px] border-zk-black transition-all mx-auto ${
                      isInactive
                        ? 'bg-gray-700 text-white/50 cursor-not-allowed'
                        : `${config.buttonColor} text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:brightness-110`
                    }`}
                    style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '2.2rem', letterSpacing: '2px' }}
                  >
                    <Icon className="w-8 h-8" />
                    <span style={{ paddingTop: '4px' }}>{isSkillLockedOut ? skillLockoutMsg : `USE ${config.name.toUpperCase()} (${skillChargesLeft})`}</span>
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
            className="flex flex-col items-center justify-center mt-4"
          >
            <div className="bg-zk-black border-[4px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-3xl px-12 py-8 flex flex-col items-center text-center">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ repeat: Infinity, duration: 0.5, repeatType: "reverse", ease: "easeInOut" }}
              >
                <Lock className="w-16 h-16 text-zk-yellow" />
              </motion.div>
              <p className="text-white font-black mt-4 uppercase leading-none" style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '3rem', letterSpacing: '2px' }}>Answer locked in!</p>
              <p className="text-white/60 font-bold text-sm mt-3 uppercase tracking-[0.3em]">Waiting for results...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
