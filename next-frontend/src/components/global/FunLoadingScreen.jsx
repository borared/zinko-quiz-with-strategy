"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function FunLoadingScreen({ fullScreen = false, text = "Loading...", subText }) {
  const containerClass = fullScreen 
    ? "flex-1 w-full min-h-screen bg-zk-bg flex flex-col items-center justify-center relative overflow-hidden"
    : "flex-1 w-full min-h-[calc(100vh-76px)] bg-zk-bg flex flex-col items-center justify-center relative overflow-hidden";

  return (
    <div className={containerClass}>
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[500px] h-[500px] bg-zk-blue/20 rounded-full blur-3xl pointer-events-none"
      />
      
      <div className="relative flex flex-col items-center">
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="bg-zk-panel-bg border-[4px] border-zk-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-4 mb-8 rounded-2xl"
        >
          <span className="font-black text-5xl tracking-tighter italic permanent-marker-regular text-zk-text">
            Zinko
          </span>
        </motion.div>

        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-[6px] border-zk-border border-t-[#5D3FD3] rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 border-[6px] border-[#5D3FD3] rounded-full"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <h2 className="text-2xl font-black text-zk-text tracking-wider uppercase">
            {text}
          </h2>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                className="w-2 h-2 bg-zk-text rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {subText && (
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-12 text-zk-text/60 font-bold text-sm bg-zk-panel-bg/50 px-6 py-2 border-[2px] border-zk-border/20 rounded-full"
        >
          {subText}
        </motion.p>
      )}
    </div>
  );
}
