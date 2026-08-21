"use client";
import { motion, AnimatePresence } from 'framer-motion';

export default function FoxSmokescreen({ isActive, isLeader, teamCounterBlindCharges, onCounterBlind }) {
  const blobs = [
    { x: '10vw', y: '5vh', size: '35vw', delay: 0 },
    { x: '60vw', y: '-8vh', size: '42vw', delay: 0.08 },
    { x: '25vw', y: '25vh', size: '55vw', delay: 0.04 },
    { x: '-8vw', y: '50vh', size: '40vw', delay: 0.12 },
    { x: '68vw', y: '55vh', size: '48vw', delay: 0.16 },
    { x: '-12vw', y: '15vh', size: '38vw', delay: 0.06 },
    { x: '78vw', y: '20vh', size: '40vw', delay: 0.1 },
    { x: '28vw', y: '68vh', size: '52vw', delay: 0.2 },
  ];

  const droplets = [
    { x: '35vw', y: '18vh', size: '7vw', delay: 0.08, tx: -90, ty: -80 },
    { x: '72vw', y: '12vh', size: '8vw', delay: 0.14, tx: 100, ty: -90 },
    { x: '20vw', y: '60vh', size: '6vw', delay: 0.18, tx: -100, ty: 90 },
    { x: '82vw', y: '50vh', size: '9vw', delay: 0.22, tx: 110, ty: 100 },
  ];

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/10 flex flex-col items-center justify-center pointer-events-none overflow-hidden backdrop-blur-[3px]"
        >
          {/* SVG Gooey Filter */}
          <svg className="absolute w-0 h-0 hidden" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="gooey-splat">
                <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -10" result="goo" />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </defs>
          </svg>

          {/* Splatoon Slime/Ink Container */}
          <div 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ filter: 'url(#gooey-splat)' }}
          >
            {/* Main Splat Blobs */}
            {blobs.map((blob, index) => (
              <motion.div
                key={`blob-${index}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 90, 
                  damping: 12, 
                  delay: blob.delay 
                }}
                className="absolute bg-gradient-to-br from-orange-500 to-orange-600 rounded-full"
                style={{
                  left: blob.x,
                  top: blob.y,
                  width: blob.size,
                  height: blob.size,
                  boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)'
                }}
              />
            ))}

            {/* Flying Ink Droplets */}
            {droplets.map((drop, index) => (
              <motion.div
                key={`drop-${index}`}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ scale: 1, x: drop.tx, y: drop.ty }}
                transition={{ 
                  type: "spring", 
                  stiffness: 110, 
                  damping: 14, 
                  delay: drop.delay 
                }}
                className="absolute bg-orange-600 rounded-full"
                style={{
                  left: drop.x,
                  top: drop.y,
                  width: drop.size,
                  height: drop.size,
                  boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.15)'
                }}
              />
            ))}
          </div>

          {/* Foreground UI overlay */}
          <div className="relative z-10 flex flex-col items-center gap-2 mt-4 text-center px-4">
            <h1 className="text-white font-black text-5xl md:text-7xl uppercase tracking-widest permanent-marker-regular drop-shadow-[0_6px_0_rgba(0,0,0,1)]">
              Blinded
            </h1>
            <p className="text-white/90 font-bold font-['Outfit'] text-lg md:text-xl tracking-wide bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
              You can still click... if you feel lucky!
            </p>
            {isLeader && teamCounterBlindCharges > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCounterBlind();
                }}
                className="mt-6 pointer-events-auto bg-zk-yellow text-zk-black border-4 border-zk-border px-8 py-3 rounded-full flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-xl"
              >
                <span 
                  className="font-black text-2xl md:text-3xl tracking-wide uppercase"
                  style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
                >
                  Counter Blind
                </span>
                <span className="bg-black text-white px-2 py-0.5 rounded-md text-sm md:text-base font-bold">
                  x{teamCounterBlindCharges}
                </span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
