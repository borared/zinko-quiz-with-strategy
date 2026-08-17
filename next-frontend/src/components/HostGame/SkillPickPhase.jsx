"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function SkillPickPhase({ skillTimeLeft }) {
  return (
    <motion.div
      key="skill_pick"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Floating decorations */}
      <motion.div
        animate={{ y: [-12, 12, -12], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[8%] w-16 h-16 bg-[#5D3FD3] border-[4px] border-zk-border shadow-[4px_4px_0_#000] rounded-xl"
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[15%] right-[10%] w-20 h-20 bg-[#3B68FF] border-[4px] border-zk-border shadow-[4px_4px_0_#000] rounded-full"
      />
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: 45 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[15%] w-12 h-12 bg-[#E74C3C] border-[4px] border-zk-border shadow-[4px_4px_0_#000] rounded-xl"
      />

      <motion.h1
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="text-[5rem] md:text-[8rem] font-black uppercase text-white tracking-wide permanent-marker-regular leading-none text-center z-10"
        style={{
          WebkitTextStroke: "5px #000",
          textShadow: "8px 8px 0 #000",
        }}
      >
        Skill Time
      </motion.h1>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-zk-panel-bg border-[2px] border-zk-border rounded-lg px-12 py-6 flex flex-col items-center z-10"
      >
        <span className="text-zk-text/60 font-black uppercase tracking-widest text-sm mb-1">
          Pick your skill
        </span>
        <span
          className="text-6xl font-black text-[#5D3FD3]"
          style={{ WebkitTextStroke: "2px #000" }}
        >
          {skillTimeLeft}s
        </span>
      </motion.div>
    </motion.div>
  );
}
