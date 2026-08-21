"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PLANETS = ['moon', 'mars', 'earth'];

function playBeep(pitch = 440, duration = 0.15) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    // Smooth decay to prevent clicking sounds
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("[Audio] Failed to play countdown beep:", e);
  }
}

export default function QuestionIntroOverlay({ onComplete }) {
  const [countdown, setCountdown] = useState(3);
  const [planetType] = useState(() => PLANETS[Math.floor(Math.random() * PLANETS.length)]);
  const soundPlayedRef = useRef(new Set());

  useEffect(() => {
    // Play initial "3" beep
    if (!soundPlayedRef.current.has(3)) {
      playBeep(440, 0.15);
      soundPlayedRef.current.add(3);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next > 0) {
          // Play beep for "2" and "1"
          if (!soundPlayedRef.current.has(next)) {
            playBeep(440, 0.15);
            soundPlayedRef.current.add(next);
          }
          return next;
        } else {
          clearInterval(timer);
          // Play final "Go!" chime
          playBeep(880, 0.35);
          setTimeout(onComplete, 500); // Small pause for the final sound to finish
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/75 backdrop-blur-md px-4 overflow-hidden">
      {/* Gooey filter for the planet & elements */}
      <svg className="hidden">
        <defs>
          <filter id="gooey-planet">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="flex flex-col items-center space-y-8 select-none">
        {/* Animated Planet Wrapper */}
        <motion.div
          key={countdown}
          initial={{ scale: 0.3, rotate: -45, opacity: 0 }}
          animate={{ scale: [0.3, 1.15, 1], rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
            mass: 0.6
          }}
          className="relative w-52 h-52 flex items-center justify-center"
          style={{ filter: 'url(#gooey-planet)' }}
        >
          {/* Planet body */}
          <div className="w-48 h-48 rounded-full border-[5px] border-black shadow-[8px_8px_0_0_#000] relative overflow-hidden flex items-center justify-center">
            {planetType === 'moon' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-400 via-gray-300 to-gray-200">
                {/* Moon craters */}
                <div className="w-8 h-8 rounded-full bg-black/10 absolute top-6 left-8 border-2 border-black/5 inset-shadow-sm" />
                <div className="w-12 h-12 rounded-full bg-black/10 absolute bottom-6 right-10 border-2 border-black/5" />
                <div className="w-6 h-6 rounded-full bg-black/10 absolute top-20 right-6 border-2 border-black/5" />
              </div>
            )}

            {planetType === 'mars' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-red-600 via-orange-500 to-orange-400">
                {/* Mars details */}
                <div className="w-10 h-10 rounded-full bg-red-800/20 absolute top-8 right-12" />
                <div className="w-14 h-14 rounded-full bg-red-800/20 absolute bottom-8 left-8" />
                <div className="w-6 h-6 rounded-full bg-red-800/20 absolute top-20 left-24" />
              </div>
            )}

            {planetType === 'earth' && (
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

          {/* Large Countdown Number inside/floating on top of the planet */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span
              className="text-8xl md:text-9xl font-black text-[#FFCD29] drop-shadow-[0_6px_0_#000]"
              style={{
                fontFamily: 'var(--font-outfit)',
                WebkitTextStroke: '3px black'
              }}
            >
              {countdown > 0 ? countdown : 'GO!'}
            </span>
          </div>
        </motion.div>

        {/* Text description */}
        <div className="text-center">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
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
