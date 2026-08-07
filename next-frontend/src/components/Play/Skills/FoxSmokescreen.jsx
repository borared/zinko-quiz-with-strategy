"use client";
import { motion, AnimatePresence } from 'framer-motion';

export default function FoxSmokescreen({ isActive }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-[#1a1a1a] flex flex-col items-center justify-center pointer-events-auto overflow-hidden"
        >
          {/* Animated Smoke Clouds */}
          <motion.div 
            animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-[150vw] h-[150vh] bg-zk-panel-bg/20 blur-[100px] rounded-full"
          />
          <motion.div 
            animate={{ x: [0, 50, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-10 -right-20 w-[120vw] h-[120vh] bg-gray-400/30 blur-[120px] rounded-full"
          />
          <motion.div 
            animate={{ x: [-30, 30, -30], y: [20, -20, 20] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-40 left-0 w-[100vw] h-[100vh] bg-black/60 blur-[80px] rounded-full"
          />

          <h1 className="relative z-10 text-white font-black text-5xl md:text-7xl uppercase tracking-widest text-center px-4 permanent-marker-regular drop-shadow-[0_6px_0_rgba(0,0,0,1)]">
            Blinded
          </h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
