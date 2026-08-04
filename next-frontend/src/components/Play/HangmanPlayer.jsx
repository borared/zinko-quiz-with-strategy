"use client";
import React, { useEffect, useCallback } from 'react';
import { Heart, HeartCrack, HelpCircle, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QWERTY = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export default function HangmanPlayer({ hangmanData, team, onGuess, background }) {
  const { word, wordLength, hint, category, state } = hangmanData;
  const myState = state[team] || { lives: 0, guessedLetters: [], isEliminated: false };
  const { lives, guessedLetters, isEliminated } = myState;

  const handleKeyPress = useCallback((key) => {
    if (isEliminated) return;
    const upperKey = key.toUpperCase();
    if (/^[A-Z]$/.test(upperKey) && !guessedLetters.includes(upperKey)) {
      onGuess(upperKey);
    }
  }, [isEliminated, guessedLetters, onGuess]);

  useEffect(() => {
    const onKeyDown = (e) => handleKeyPress(e.key);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKeyPress]);

  if (isEliminated) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-50 bg-zk-black/80 backdrop-blur-sm">
        <motion.img 
          src="/images/model_answer/wrong.png" 
          alt="Eliminated" 
          className="w-80 h-80 sm:w-96 sm:h-96 mb-8 drop-shadow-[0_20px_0_rgba(0,0,0,0.8)]" 
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <h2 className="gasoek-one-regular text-7xl text-zk-red uppercase tracking-widest mb-4 drop-shadow-[0_6px_0_#000]" style={{ WebkitTextStroke: '3px black' }}>Eliminated!</h2>
        <p className="text-4xl text-white font-bold drop-shadow-[0_4px_0_#000]" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '3px' }}>Your team ran out of lives.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center p-4 z-20 relative text-white pt-12 bg-zk-blue min-h-[100dvh] overflow-hidden w-full">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => {
          const isIcon = i % 2 === 0;
          const letters = ['A', 'E', '?', '!'];
          const randomLetter = letters[i % letters.length];
          const size = Math.random() * 40 + 30;
          return (
            <motion.div
              key={i}
              className="absolute text-white/40 font-black flex items-center justify-center"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${size}px`,
                fontFamily: 'var(--font-amatic-sc)'
              }}
              animate={{
                y: [0, -40, 0],
                rotate: [0, 15, -15, 0],
                x: [0, 20, -20, 0]
              }}
              transition={{
                duration: Math.random() * 5 + 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            >
              {isIcon ? (
                i % 4 === 0 ? <Skull width={size} height={size} /> : <HelpCircle width={size} height={size} />
              ) : (
                randomLetter
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center w-full max-w-3xl mx-auto">
      {/* Hint */}
      {hint && (
        <div className="bg-zk-blue px-6 py-4 rounded-3xl border-[4px] border-black mb-6 max-w-2xl text-center">
          {category && <p className="text-zk-yellow font-bold uppercase tracking-widest text-lg mb-1" style={{ fontFamily: 'var(--font-amatic-sc)' }}>Category: {category}</p>}
          <p className="text-white font-bold text-xl">{hint}</p>
        </div>
      )}

      {/* Lives counter */}
      <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-4 rounded-full border-[4px] border-black mb-8">
        <Heart className="w-8 h-8 text-zk-red fill-zk-red animate-pulse" />
        <span className="font-black text-4xl text-white">{lives}</span>
        <span className="text-white/80 font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '24px' }}>Lives</span>
      </div>

      <div className="flex items-center gap-3 mb-12 flex-wrap justify-center max-w-[90vw]">
        {word && word.split('').map((char, i) => {
          const isGuessed = guessedLetters.includes(char);
          return (
            <motion.div 
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="w-12 h-14 sm:w-14 sm:h-16 bg-zk-yellow border-[4px] border-black shadow-[4px_4px_0_#000] flex items-center justify-center text-4xl sm:text-5xl font-black text-black uppercase rounded-lg"
              style={{ fontFamily: 'var(--font-amatic-sc)' }}
            >
              {isGuessed ? char : ''}
            </motion.div>
          );
        })}
      </div>

      <div className="w-full max-w-lg mt-auto pb-8">
        <div className="flex flex-col gap-2">
          {QWERTY.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-2">
              {row.map(letter => {
                const isGuessed = guessedLetters.includes(letter);
                return (
                  <button
                    key={letter}
                    disabled={isGuessed}
                    onClick={() => handleKeyPress(letter)}
                    className={`
                      relative w-10 h-14 sm:w-12 sm:h-16 rounded-lg font-black text-3xl flex items-center justify-center transition-all border-[4px] border-black
                      ${isGuessed 
                        ? 'bg-black/30 text-white/30 cursor-not-allowed shadow-none translate-y-1' 
                        : 'bg-white text-black hover:-translate-y-1 active:translate-y-1 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] active:shadow-none'}
                    `}
                    style={{ fontFamily: 'var(--font-amatic-sc)' }}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
