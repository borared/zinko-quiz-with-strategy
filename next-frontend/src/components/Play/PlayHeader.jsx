"use client";
import React from 'react';
import { motion } from 'framer-motion';

import { DEFAULT_TIME_LIMIT } from '@/lib/timeLimit';

export default function PlayHeader({ nickname, question, timeLeft, totalTime = DEFAULT_TIME_LIMIT }) {
  return (
    <div className="flex flex-col px-5 pt-5 pb-3">
      <div className="flex items-center justify-between">
        {/* Player Badge */}
        <div className="bg-zk-black border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-xl px-4 py-2 text-left">
          <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold leading-none mb-1">Player</p>
          <p className="text-white font-black leading-none" style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '1.5rem', letterSpacing: '1px', paddingTop: '2px' }}>{nickname}</p>
        </div>

        {/* Timer pill */}
        <div className={`rounded-xl px-5 py-2 font-black border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-colors ${
          timeLeft <= 5 ? 'bg-[#E74C3C] text-white' :
          timeLeft <= 10 ? 'bg-[#F39C12] text-white' :
          'bg-zk-black text-white'
        }`} style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '2rem', letterSpacing: '2px' }}>
          {timeLeft}
        </div>

        {/* Progress Badge */}
        <div className="bg-zk-black border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-xl px-4 py-2 text-right">
          <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold leading-none mb-1">Progress</p>
          <p className="text-white font-black leading-none" style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '1.5rem', letterSpacing: '1px', paddingTop: '2px' }}>
            R{question?.round || 1} <span className="text-white/40">| M{question?.match || 1}</span>
          </p>
        </div>
      </div>

      {/* Status bar */}
      <div className="w-full mt-4 mb-1">
        <div className="h-1.5 rounded-full bg-zk-panel-bg/10 overflow-hidden">
          <motion.div
            className="h-full bg-[#FFCD29] rounded-full"
            animate={{ width: `${(timeLeft / totalTime) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
}
