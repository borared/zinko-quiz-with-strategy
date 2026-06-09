"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function PlayHeader({ nickname, question, timeLeft }) {
  return (
    <div className="flex flex-col px-5 pt-5 pb-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Player</p>
          <p className="text-white font-black text-base">{nickname}</p>
        </div>

        {/* Progress */}
        <div className="text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Progress</p>
          <p className="text-white font-black text-base">
            R{question?.round || 1} <span className="text-white/30">| M{question?.match || 1}</span>
          </p>
        </div>

        {/* Timer pill */}
        <div className={`rounded-full px-4 py-2 font-black text-xl border-2 transition-colors ${
          timeLeft <= 5 ? 'bg-[#E74C3C] border-[#C0392B] text-white' :
          timeLeft <= 10 ? 'bg-[#F39C12] border-[#D68910] text-white' :
          'bg-white/10 border-white/20 text-white'
        }`}>
          {timeLeft}
        </div>
      </div>

      {/* Status bar */}
      <div className="w-full mt-4 mb-1">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-[#FFCD29] rounded-full"
            animate={{ width: `${(timeLeft / 20) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
}
