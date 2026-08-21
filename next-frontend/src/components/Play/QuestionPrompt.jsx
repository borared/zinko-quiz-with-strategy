"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSkillConfig } from '../../config/skills';
import { Lock } from 'lucide-react';
import { isDragLayersQuestion, isLineMatchingQuestion, resolveQuestionType, QUESTION_TYPES } from '@/lib/questionTypes';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';

export default function QuestionPrompt({
  phase,
  question,
  selectedId,
  playerSkill,
  isSkillLockedOut,
  skillLockoutMsg,
  skillChargesLeft,
  foxSmokescreen,
  handleUseSkill,
  children,
}) {
  const isDragLayers = isDragLayersQuestion(question?.questionType);
  const isLineMatching = isLineMatchingQuestion(question?.questionType);
  const usesMatchingPanel = isDragLayers || isLineMatching;

  const skillButton = playerSkill ? (() => {
    const config = getSkillConfig(playerSkill);
    const Icon = config.icon;
    
    // Resolve question type to restrict butterfly
    const qType = resolveQuestionType(question);
    const isNotMultipleChoice = playerSkill === 'butterfly' && qType !== QUESTION_TYPES.MULTIPLE_CHOICE;
    
    const isInactive = isSkillLockedOut || skillChargesLeft <= 0 || foxSmokescreen || isNotMultipleChoice;
    
    let buttonText = `USE ${config.name.toUpperCase()} (${skillChargesLeft})`;
    if (isSkillLockedOut) {
      buttonText = skillLockoutMsg;
    } else if (isNotMultipleChoice) {
      buttonText = "MULTIPLE CHOICE ONLY";
    }

    return (
      <button
        onClick={handleUseSkill}
        disabled={isInactive}
        className={`flex items-center justify-center gap-3 px-8 py-3 rounded-full font-black uppercase border-2 border-zk-border transition-all mx-auto ${
          isInactive
            ? 'bg-gray-700 text-white/50 cursor-not-allowed'
            : `${config.buttonColor} text-white hover:brightness-110 active:brightness-95`
        }`}
        style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '2.2rem', letterSpacing: '2px' }}
      >
        <Icon className="w-8 h-8" />
        <span style={{ paddingTop: '4px' }}>{buttonText}</span>
      </button>
    );
  })() : null;

  return (
    <div
      className={`flex flex-col items-center gap-3 mt-2 ${
        usesMatchingPanel
          ? 'flex-1 min-h-0 justify-start sm:justify-center pb-3 sm:pb-4 px-2 sm:px-4 w-full'
          : 'flex-1 min-h-0 justify-center px-3 sm:px-5'
      }`}
    >
      {phase === 'PLAYING' && !selectedId && question && usesMatchingPanel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full mx-auto flex flex-col h-auto max-h-[calc(100dvh-11rem)] sm:max-h-[calc(100dvh-10rem)] rounded-xl sm:rounded-2xl overflow-hidden ${
            isLineMatching
              ? 'bg-transparent border-none'
              : 'bg-zk-panel-bg border-2 border-zk-border'
          } ${
            isDragLayers ? 'max-w-6xl lg:max-w-7xl' : 'max-w-5xl lg:max-w-6xl'
          }`}
        >
          <div className="flex flex-col h-auto w-full gap-3 sm:gap-4 p-3 sm:p-5 overflow-y-auto">
            {question.imageUrl && (
              <div className="w-full max-w-sm mx-auto rounded-lg overflow-hidden border-2 border-zk-border bg-gray-100 shrink-0 mb-1">
                <img src={getOptimizedImageUrl(question.imageUrl, 400)} alt="Question" className="w-full max-h-[15vh] object-contain" />
              </div>
            )}
            <p className={`font-black text-2xl sm:text-3xl lg:text-4xl leading-tight text-center shrink-0 ${
              isLineMatching ? 'text-white' : 'text-zk-text'
            }`}>
              {question.questionText}
            </p>

            <div className="text-center px-1 shrink-0">
              {skillButton || (
                <p className="inline-block max-w-full px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-zk-black border-2 border-zk-border text-white font-black text-xs sm:text-sm uppercase tracking-wide sm:tracking-widest">
                  {isLineMatching
                    ? 'Drag or tap to connect'
                    : 'Drag or tap steps into order, then lock in'}
                </p>
              )}
            </div>

            <div className="flex flex-col h-auto min-h-0 w-full">
              {children}
            </div>
          </div>
        </motion.div>
      )}

      {phase === 'PLAYING' && !selectedId && question && !usesMatchingPanel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-zk-panel-bg rounded-2xl p-5 border-2 border-zk-border text-center"
        >
          {question.imageUrl && (
            <div className="w-full max-w-sm mx-auto rounded-xl overflow-hidden border-2 border-zk-border bg-gray-100 mb-3">
              <img src={getOptimizedImageUrl(question.imageUrl, 500)} alt="Question" className="w-full max-h-[25vh] object-contain" />
            </div>
          )}
          <p className="text-zk-text font-black text-xl lg:text-2xl leading-tight">
            {question.questionText}
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'PLAYING' && !selectedId && !usesMatchingPanel && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {skillButton || (
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
            <div className="bg-zk-black border-2 border-black rounded-3xl px-12 py-8 flex flex-col items-center text-center">
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
