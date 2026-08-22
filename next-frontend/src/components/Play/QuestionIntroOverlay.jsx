"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function playBeep(pitch = 440, duration = 0.15) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("[Audio] Failed to play countdown beep:", e);
  }
}

function CartoonPlanet({ type, sizeClass = "w-48 h-48", className = "" }) {
  return (
    <div className={`rounded-full border-[5px] border-black shadow-[8px_8px_0_0_#000] relative overflow-hidden flex items-center justify-center ${sizeClass} ${className}`}>
      {type === 'moon' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-400 via-gray-300 to-gray-200">
          {/* Moon craters */}
          <div className="w-8 h-8 rounded-full bg-black/10 absolute top-6 left-8 border-2 border-black/5" />
          <div className="w-12 h-12 rounded-full bg-black/10 absolute bottom-6 right-10 border-2 border-black/5" />
          <div className="w-6 h-6 rounded-full bg-black/10 absolute top-20 right-6 border-2 border-black/5" />
        </div>
      )}

      {type === 'mars' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-red-600 via-orange-500 to-orange-400">
          {/* Mars details */}
          <div className="w-10 h-10 rounded-full bg-red-800/20 absolute top-8 right-12" />
          <div className="w-14 h-14 rounded-full bg-red-800/20 absolute bottom-8 left-8" />
          <div className="w-6 h-6 rounded-full bg-red-800/20 absolute top-20 left-24" />
        </div>
      )}

      {type === 'earth' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400">
          {/* Earth continents */}
          <div className="w-16 h-12 bg-green-500 rounded-full absolute top-6 left-6 rotate-12 border-2 border-black/5" />
          <div className="w-20 h-16 bg-green-500 rounded-full absolute bottom-4 right-4 -rotate-12 border-2 border-black/5" />
          <div className="w-8 h-8 bg-green-500 rounded-full absolute top-12 right-12 border-2 border-black/5" />
        </div>
      )}

      {/* Inner shadows for cartoon 3D effect */}
      <div className="absolute inset-0 rounded-full border-[6px] border-black/10 pointer-events-none" />
    </div>
  );
}

export default function QuestionIntroOverlay({ onComplete }) {
  const [countdown, setCountdown] = useState(3);
  const soundPlayedRef = useRef(new Set());

  useEffect(() => {
    // Play initial "3" beep
    if (!soundPlayedRef.current.has(3)) {
      playBeep(440, 0.12);
      soundPlayedRef.current.add(3);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next > 0) {
          if (!soundPlayedRef.current.has(next)) {
            playBeep(440, 0.12);
            soundPlayedRef.current.add(next);
          }
          return next;
        } else {
          clearInterval(timer);
          playBeep(880, 0.3);
          setTimeout(onComplete, 550);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 px-4 overflow-hidden">
      {/* Background space elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping duration-1000" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full animate-ping duration-1000 delay-300" />
        <div className="absolute bottom-1/4 right-1/3 w-2.5 h-2.5 bg-white rounded-full animate-ping duration-1000 delay-700" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-ping duration-1000 delay-500" />
      </div>

      {/* LEFT PLANET: Earth - Peaks in from left edge */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-150px] sm:left-[-100px] top-[15%] pointer-events-none"
      >
        <CartoonPlanet type="earth" sizeClass="w-64 h-64 sm:w-72 sm:h-72" />
      </motion.div>

      {/* RIGHT PLANET: Mars - Peaks in from right edge */}
      <motion.div
        animate={{ y: [12, -12, 12], rotate: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute right-[-160px] sm:right-[-100px] bottom-[15%] md:top-[20%] pointer-events-none"
      >
        <CartoonPlanet type="mars" sizeClass="w-72 h-72 sm:w-80 sm:h-80" />
      </motion.div>

      {/* EXTRA PLANET: Moon - Peaking in from bottom left */}
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: [-3, 3, -3] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute left-[8%] bottom-[-100px] pointer-events-none hidden md:block"
      >
        <CartoonPlanet type="moon" sizeClass="w-48 h-48 sm:w-56 sm:h-56" />
      </motion.div>

      {/* CENTER COUNTDOWN LAYOUT */}
      <div className="flex flex-col items-center space-y-8 select-none z-10 text-center">
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Dashboard rotating target ring */}
          <div className="absolute inset-0 rounded-full border-[8px] border-dashed border-[#FFCD29]/20 animate-spin duration-[30s]" />
          <div className="absolute inset-6 rounded-full border-[4px] border-black/40 shadow-[4px_4px_0_0_rgba(0,0,0,0.15)]" />

          {/* Large Countdown Number */}
          <AnimatePresence mode="wait">
            <motion.span
              key={countdown}
              initial={{ scale: 0.4, opacity: 0, rotate: -25 }}
              animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, rotate: 25 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 14,
                mass: 0.5
              }}
              className="text-9xl md:text-[10rem] font-black text-[#FFCD29] drop-shadow-[0_8px_0_#000] gasoek-one-regular"
              style={{
                fontFamily: 'var(--font-gasoek-one)',
                WebkitTextStroke: '4px black'
              }}
            >
              {countdown > 0 ? countdown : 'GO!'}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Text description */}
        <div className="text-center">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            className="text-5xl md:text-7xl font-bold text-white uppercase tracking-widest leading-none pt-4"
            style={{
              fontFamily: 'var(--font-amatic-sc)',
              letterSpacing: '4px'
            }}
          >
            Are you ready?
          </motion.h2>
        </div>
      </div>
    </div>
  );
}
