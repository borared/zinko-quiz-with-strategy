"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

export default function HigherLowerPlayer({ onGuess, onSetSecret, statusObj, subPhase, currentTurn, team }) {
  const [input, setInput] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Handle local countdown animation
  useEffect(() => {
    if (subPhase === 'COUNTDOWN') {
      setCountdown(3);
      const timer1 = setTimeout(() => setCountdown(2), 1000);
      const timer2 = setTimeout(() => setCountdown(1), 2000);
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [subPhase]);

  // When status changes from the server, flash it on screen
  useEffect(() => {
    if (statusObj && statusObj.value) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [statusObj]);

  const handlePress = (num) => {
    if (input.length < 2) {
      setInput(prev => prev + num);
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const handleSubmit = () => {
    if (input.length > 0) {
      if (subPhase === 'PICK') {
        onSetSecret(input);
      } else {
        onGuess(input);
      }
      setInput("");
    }
  };

  const renderKey = (label, onClick, customColor) => (
    <motion.button
      whileTap={{ scale: 0.9, y: 4, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
      onClick={onClick}
      className={`w-full h-20 sm:h-24 rounded-2xl border-[4px] border-black flex items-center justify-center text-4xl sm:text-5xl gasoek-one-regular ${customColor || 'bg-white text-black'}`}
      style={{ boxShadow: "0px 8px 0px 0px rgba(0,0,0,1)" }}
    >
      {label}
    </motion.button>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-900 relative">
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* INTRO Overlay */}
      {subPhase === 'INTRO' && (
        <motion.div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url('/background_battle/city.jpg')` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div
            initial={{ scale: 0.2, y: 50, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="text-center relative z-10"
          >
            <h1 className="gasoek-one-regular text-[80px] leading-none text-white tracking-wider" style={{ textShadow: "6px 6px 0 #000" }}>
              HIGHER
            </h1>
            <h1 className="gasoek-one-regular text-[50px] leading-none text-white tracking-wider my-[-10px]" style={{ textShadow: "4px 4px 0 #000" }}>
              OR
            </h1>
            <h1 className="gasoek-one-regular text-[80px] leading-none text-white tracking-wider" style={{ textShadow: "6px 6px 0 #000" }}>
              LOWER
            </h1>
          </motion.div>
        </motion.div>
      )}

      {/* Countdown Overlay */}
      {subPhase === 'COUNTDOWN' && (
        <motion.div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-[180px] text-white gasoek-one-regular"
            style={{ textShadow: "0 8px 0 #000, 0 10px 20px rgba(0,0,0,0.8)" }}
          >
            {countdown}
          </motion.div>
        </motion.div>
      )}

      {/* Waiting for Turn Overlay */}
      {subPhase === 'GUESS' && currentTurn !== team && (
        <motion.div 
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-zk-yellow px-10 py-6 rounded-3xl border-[6px] border-black shadow-[0_8px_0_0_#000] rotate-[-2deg] flex flex-col items-center">
            <h2 className="gasoek-one-regular text-4xl text-black uppercase tracking-widest text-center" style={{ textShadow: "2px 2px 0px rgba(255,255,255,0.5)" }}>
              ENEMY TURN
            </h2>
            <p className="font-bold text-2xl mt-2 opacity-80" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>
              Awaiting their guess...
            </p>
          </div>
        </motion.div>
      )}

      {/* Status Feedback Overlay */}
      <AnimatePresence>
        {showStatus && statusObj && subPhase === 'GUESS' && (
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.8 }}
            className={`absolute top-10 z-50 px-8 py-4 rounded-full border-[4px] border-black text-3xl sm:text-4xl gasoek-one-regular text-white tracking-widest ${
              statusObj.value === 'HIGHER' ? 'bg-blue-500' : 'bg-red-500'
            }`}
            style={{ boxShadow: "0px 6px 0px 0px rgba(0,0,0,1)" }}
          >
            {statusObj.value === 'HIGHER' ? 'HIGHER!' : 'LOWER!'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">
        {/* Display Screen */}
        <div className="w-full bg-[#1A1A24] border-[6px] border-black rounded-3xl h-32 flex flex-col items-center justify-center shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
          <div className="text-white/50 text-xl font-bold uppercase tracking-widest mb-1 text-center" style={{ fontFamily: 'var(--font-amatic-sc)' }}>
            {subPhase === 'PICK' ? 'SET SECRET CODE (1-99)' : 'CRACK ENEMY CODE'}
          </div>
          <div className="text-6xl text-zk-yellow gasoek-one-regular tracking-widest">
            {input || "--"}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <React.Fragment key={num}>
              {renderKey(num.toString(), () => handlePress(num.toString()))}
            </React.Fragment>
          ))}
          {renderKey("C", handleClear, "bg-red-500 text-white")}
          {renderKey("0", () => handlePress("0"))}
          {renderKey(subPhase === 'PICK' ? <Lock size={36} strokeWidth={3} /> : 'GO', handleSubmit, "bg-green-500 text-white")}
        </div>
      </div>
    </div>
  );
}
