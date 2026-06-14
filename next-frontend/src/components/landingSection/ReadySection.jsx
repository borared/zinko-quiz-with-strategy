"use client";
import React from 'react';
import { motion } from 'framer-motion';

const ReadySection = () => {
  return (
    <section className="relative overflow-hidden w-full py-24 px-4 bg-gradient-to-r from-yellow-50 via-white to-teal-50 font-sans">

      {/* Floating Kawaii Elements */}
      {/* Heart */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 -ml-[120px] bottom-4 w-24 h-24 pointer-events-none mix-blend-multiply opacity-90 z-0"
      >
        <img src="/heart.png" alt="Kawaii Heart" className="w-full h-full object-contain" />
      </motion.div>

      {/* Floating Shapes */}
      <motion.div
        animate={{ y: [15, -15, 15], rotate: 360 }}
        transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 10, repeat: Infinity, ease: "linear" } }}
        className="absolute top-[20%] left-[15%] w-6 h-6 rounded-full border-[3px] border-zk-black bg-[#FFD12B] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] pointer-events-none hidden md:block"
      />
      <motion.div
        animate={{ y: [-20, 20, -20], rotate: -360 }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 12, repeat: Infinity, ease: "linear" } }}
        className="absolute top-[40%] right-[20%] w-8 h-8 border-[3px] border-zk-black bg-[#6E5CF2] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] pointer-events-none hidden md:block transform rotate-45 rounded-xl"
      />
      <motion.div
        animate={{ y: [10, -10, 10], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] left-[25%] w-4 h-4 rounded-full border-[2px] border-zk-black bg-[#FF6B4A] pointer-events-none hidden md:block"
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">

        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-black text-zk-black mb-4 gasoek-one-regular tracking-tight">
          Ready to make quiz gain more hype?
        </h2>

        {/* Subtitle */}
        <p className="text-zk-black font-bold text-xl md:text-3xl mb-10 max-w-2xl mx-auto"
          style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
        >
          Join millions of educators, trainers, and team leaders who use Zinko to engage their audiences.
        </p>

        {/* CTA Button */}
        <button className="font-black text-xl bg-[#FFD12B] text-[#6E5CF2] border-[4px] border-zk-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-12 py-5 flex items-center gap-3 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none mb-4 rounded-full">
          Start for free
        </button>

        {/* Microcopy */}
        <p className="text-zk-black/50 font-bold text-xs mt-2">
          No credit card needed
        </p>

      </div>
    </section>
  );
};

export default ReadySection;
