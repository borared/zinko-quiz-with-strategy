"use client";
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { HelpCircle, Skull, Trophy } from 'lucide-react';
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react').then((mod) => mod.default), { ssr: false });
import championLottieData from '@/lib/settings-profile-lottie.json';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketStore } from '@/store/useSocketStore';

const QWERTY = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
];

// Premium Neon Feedback Colors (Blue, Orange, Slate)
const CELL_BG = {
  correct: 'bg-[#3498db] border-[#3498db] text-white font-bold shadow-[0_0_12px_rgba(52,152,219,0.6)]',
  present: 'bg-[#e67e22] border-[#e67e22] text-white font-bold shadow-[0_0_12px_rgba(230,126,34,0.6)]',
  absent: 'bg-[#34495e] border-[#34495e] text-white font-bold',
  empty: 'border-white/40 bg-neutral-950 text-white'
};

const KEY_BG = {
  correct: 'bg-[#3498db] text-white border-[#3498db] shadow-[0_0_8px_rgba(52,152,219,0.4)]',
  present: 'bg-[#e67e22] text-white border-[#e67e22] shadow-[0_0_8px_rgba(230,126,34,0.4)]',
  absent: 'bg-[#34495e] text-white border-[#34495e]',
  default: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 hover:-translate-y-0.5 active:translate-y-0 shadow-md active:shadow-none'
};

export default function FiveGridPlayer({ fivegridData, team, onGuess, background, isLeader, timeLeft, overrideWinnerData }) {
  const { wordLength = 5, category, state, hint } = fivegridData;
  const myState = state?.[team] || { lives: 5, guesses: [], isEliminated: false };
  const { guesses = [], isEliminated } = myState;
  const isSolved = guesses.some(g => g.result.every(res => res === 'correct'));

  const [mounted, setMounted] = useState(false);
  const [bgElements, setBgElements] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const { getSocket, isConnected } = useSocketStore();
  const [error, setError] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [winnerData, setWinnerData] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected) return;

    const onInvalidGuess = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 2000);
    };

    const onWinner = (data) => setWinnerData(data);

    socket.on('game:fivegrid-invalid-guess', onInvalidGuess);
    socket.on('game:fivegrid-winner', onWinner);
    return () => {
      socket.off('game:fivegrid-invalid-guess', onInvalidGuess);
      socket.off('game:fivegrid-winner', onWinner);
    };
  }, [getSocket, isConnected]);

  // 5x5 Grid constraints
  const maxAttempts = 5;

  useEffect(() => {
    setMounted(true);
    const elements = [...Array(6)].map((_, i) => {
      const isIcon = i % 2 === 0;
      const letters = ['F', 'I', 'V', 'E', 'G', 'R', 'I', 'D', '?', '!'];
      const randomLetter = letters[i % letters.length];
      const size = Math.random() * 40 + 30;
      return {
        id: i,
        isIcon,
        isSkull: i % 4 === 0,
        letter: randomLetter,
        size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 65}%`,
        duration: Math.random() * 5 + 6,
        delay: Math.random() * 5,
      };
    });
    setBgElements(elements);
  }, []);

  // Compute key statuses for the virtual keyboard
  const keyStatuses = useMemo(() => {
    const statuses = {};
    guesses.forEach(g => {
      g.word.split('').forEach((letter, i) => {
        const resultStatus = g.result[i];
        const currentBest = statuses[letter];
        if (resultStatus === 'correct') {
          statuses[letter] = 'correct';
        } else if (resultStatus === 'present' && currentBest !== 'correct') {
          statuses[letter] = 'present';
        } else if (resultStatus === 'absent' && currentBest !== 'correct' && currentBest !== 'present') {
          statuses[letter] = 'absent';
        }
      });
    });
    return statuses;
  }, [guesses]);

  // Handle typing & interaction
  const handleInput = useCallback((char) => {
    if (isEliminated || isSolved || !isLeader) return;
    if (currentGuess.length < wordLength) {
      setCurrentGuess(prev => prev + char.toUpperCase());
    }
  }, [isEliminated, isSolved, isLeader, currentGuess, wordLength]);

  const handleDelete = useCallback(() => {
    if (isEliminated || isSolved || !isLeader) return;
    setCurrentGuess(prev => prev.slice(0, -1));
  }, [isEliminated, isSolved, isLeader]);

  const handleSubmit = useCallback(() => {
    if (isEliminated || isSolved || !isLeader) return;
    if (currentGuess.length === wordLength) {
      onGuess(currentGuess);
      setCurrentGuess('');
    }
  }, [isEliminated, isSolved, isLeader, currentGuess, wordLength, onGuess]);

  const handleKeyPress = useCallback((key) => {
    if (isEliminated || isSolved || !isLeader) return;
    
    const upperKey = key.toUpperCase();
    if (upperKey === 'ENTER') {
      handleSubmit();
    } else if (upperKey === 'BACKSPACE' || upperKey === 'DELETE') {
      handleDelete();
    } else if (/^[A-Z]$/.test(upperKey)) {
      handleInput(upperKey);
    }
  }, [isEliminated, isSolved, isLeader, handleInput, handleDelete, handleSubmit]);

  useEffect(() => {
    const onKeyDown = (e) => handleKeyPress(e.key);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKeyPress]);

  const isTimeOut = timeLeft !== undefined && timeLeft <= 0;

  if (isEliminated || isTimeOut) {
    const heading = isTimeOut ? "Time's Up!" : "Eliminated!";
    const description = isTimeOut ? "Your team ran out of time." : "Your team ran out of attempts.";
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-50 bg-neutral-950/90 backdrop-blur-sm">
        <motion.img 
          src="/images/model_answer/wrong.png" 
          alt="Eliminated" 
          className="w-80 h-80 sm:w-96 sm:h-96 mb-8 drop-shadow-[0_20px_0_rgba(0,0,0,0.8)]" 
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <h2 className="gasoek-one-regular text-7xl text-zk-red uppercase tracking-widest mb-4 drop-shadow-[0_6px_0_#000]" style={{ WebkitTextStroke: '3px black' }}>{heading}</h2>
        <p className="text-4xl text-white font-bold drop-shadow-[0_4px_0_#000]" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '3px' }}>{description}</p>
      </div>
    );
  }

  const activeWinnerData = overrideWinnerData || winnerData;

  if (activeWinnerData) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-50 bg-neutral-950/90 backdrop-blur-sm">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <div className="w-48 h-48 mb-8 drop-shadow-[0_10px_0_rgba(0,0,0,0.5)]">
            <Lottie animationData={championLottieData} loop={true} style={{ width: '100%', height: '100%' }} />
          </div>
          <h2 className="gasoek-one-regular text-5xl sm:text-7xl text-zk-yellow tracking-widest mb-4 drop-shadow-[0_6px_0_#000]" style={{ WebkitTextStroke: '3px black' }}>
            {activeWinnerData.teamName} win!
          </h2>
          <p className="text-4xl text-white font-bold drop-shadow-[0_4px_0_#000]" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '3px' }}>
            Answer: {activeWinnerData.word}
          </p>
        </motion.div>
      </div>
    );
  }

  if (isSolved) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-50 bg-neutral-950/90 backdrop-blur-sm">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <Trophy className="w-48 h-48 text-zk-yellow mb-8 drop-shadow-[0_10px_0_rgba(0,0,0,0.5)]" />
          <h2 className="gasoek-one-regular text-7xl text-zk-yellow uppercase tracking-widest mb-4 drop-shadow-[0_6px_0_#000]" style={{ WebkitTextStroke: '3px black' }}>SOLVED!</h2>
          <p className="text-4xl text-white font-bold drop-shadow-[0_4px_0_#000]" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '3px' }}>Excellent teamwork! Waiting for other teams...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center p-4 z-20 relative text-black pt-4 bg-white overflow-y-auto">
      {/* Absolute positioned timer text at top right edge */}
      {timeLeft !== undefined && (
        <div className={`absolute top-6 right-6 sm:right-8 z-50 font-black text-4xl font-sans tracking-widest select-none ${timeLeft < 30 ? 'text-zk-red animate-pulse' : 'text-[#2c3e50]'}`}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      )}
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {mounted && bgElements.map((el) => (
          <motion.div
            key={el.id}
            className="absolute text-blue-500/60 font-black flex items-center justify-center"
            style={{
              left: el.left,
              top: el.top,
              fontSize: `${el.size}px`,
              fontFamily: 'var(--font-amatic-sc)'
            }}
            animate={{
              y: [0, -40, 0],
              rotate: [0, 15, -15, 0],
              x: [0, 20, -20, 0]
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: el.delay
            }}
          >
            {el.isIcon ? (
              el.isSkull ? <Skull width={el.size} height={el.size} /> : <HelpCircle width={el.size} height={el.size} />
            ) : (
              el.letter
            )}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center w-full max-w-3xl mx-auto pt-2">
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                x: [0, -10, 10, -10, 10, 0]
              }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="absolute top-16 z-[100] bg-neutral-900 border-2 border-red-500 text-red-500 font-black px-6 py-2 rounded-lg shadow-xl text-lg tracking-wider"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Category */}
        {category && (
          <div className="relative z-50 text-[#2c3e50] font-black text-2xl mb-4 font-sans bg-neutral-100 px-6 py-2 rounded-lg border-2 border-neutral-200 shadow-md">
            Category: {category}
          </div>
        )}

        {/* 5x5 Cyberpunk Board Grid */}
        <div className="relative z-50 flex flex-col gap-2 p-4 sm:p-6 bg-black rounded-xl border-4 border-neutral-900 mb-3 w-full max-w-md">
          {Array.from({ length: maxAttempts }).map((_, rIdx) => {
            const guessObj = guesses[rIdx];
            const isSubmitted = !!guessObj;
            const isCurrentRow = rIdx === guesses.length;

            return (
              <div key={rIdx} className="flex gap-2 justify-center">
                {Array.from({ length: wordLength }).map((_, cIdx) => {
                  let letter = '';
                  let status = 'empty';

                  if (isSubmitted) {
                    letter = guessObj.word[cIdx];
                    status = guessObj.result[cIdx];
                  } else if (isCurrentRow) {
                    letter = currentGuess[cIdx] || '';
                  }

                  const cellStyle = CELL_BG[status];
                  const hasLetter = letter !== '';
                  const isJustSubmitted = isSubmitted && rIdx === guesses.length - 1;

                  return (
                    <motion.div 
                      key={cIdx}
                      initial={false}
                      animate={
                        isJustSubmitted
                          ? { rotateX: [0, 90, 0] }
                          : isCurrentRow && hasLetter
                            ? { scale: [1, 1.1, 1] }
                            : {}
                      }
                      transition={
                        isJustSubmitted
                          ? { duration: 0.5, delay: cIdx * 0.15, times: [0, 0.5, 1] }
                          : { duration: 0.15 }
                      }
                      className={`w-14 h-14 sm:w-16 sm:h-16 border-2 flex items-center justify-center text-3xl sm:text-4xl font-black uppercase rounded-lg transition-all duration-300 ${cellStyle} ${isCurrentRow && hasLetter ? 'border-[#3498db] shadow-[0_0_10px_rgba(52,152,219,0.8)] scale-105' : ''}`}
                    >
                      {letter}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Keyboard and Leader Warnings */}
        <div className="w-full max-w-lg mt-auto pb-2">
          {!isLeader && (
            <div className="bg-[#1A1A24]/60 border-[3px] border-black rounded-xl p-3 text-center mb-4">
              <p className="text-zk-yellow font-black uppercase tracking-widest text-lg font-sans">
                Waiting for Leader...
              </p>
              <p className="text-white/80 font-bold text-xs mt-0.5">
                Only the Team Leader can submit guesses for your team.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {QWERTY.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1.5">
                {row.map(key => {
                  const isSpecial = key === 'ENTER' || key === 'DELETE';
                  const status = keyStatuses[key] || 'default';
                  const keyStyle = isSpecial ? 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 hover:-translate-y-0.5 active:translate-y-0 shadow-md active:shadow-none' : KEY_BG[status];
                  
                  return (
                    <button
                      key={key}
                      disabled={!isLeader}
                      onClick={() => handleKeyPress(key)}
                      className={`
                        relative rounded font-black text-xl sm:text-2xl flex items-center justify-center transition-all border border-black/40 select-none
                        ${isSpecial ? 'px-2 py-3 text-xs sm:text-sm font-sans flex-1' : 'w-9 h-12 sm:w-10 sm:h-14'}
                        ${!isLeader ? 'bg-black/30 text-white/30 cursor-not-allowed shadow-none translate-y-1 border-white/10' : keyStyle}
                      `}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Hint Button at bottom right */}
      {hint && (
        <button
          onClick={() => setShowHint(true)}
          className="absolute bottom-6 right-6 z-40 bg-neutral-100 border-2 border-neutral-200 text-[#2c3e50] font-black text-lg px-4 py-2.5 rounded-full shadow-md hover:bg-neutral-200 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          title="Show Hint"
        >
          <span>💡</span>
          <span className="hidden sm:inline font-sans font-bold">Clue</span>
        </button>
      )}

      {/* Glassmorphic Hint Overlay Modal */}
      <AnimatePresence>
        {showHint && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHint(false)}
            className="fixed inset-0 flex items-center justify-center p-6 text-center z-[100] bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border-4 border-zk-yellow rounded-2xl p-8 max-w-sm w-full shadow-2xl relative"
            >
              <div className="text-5xl mb-4">💡</div>
              <h3 className="gasoek-one-regular text-4xl text-zk-yellow tracking-widest mb-4">Clue / Hint</h3>
              <p className="text-xl text-white font-bold mb-6 font-sans">
                {hint}
              </p>
              <button
                onClick={() => setShowHint(false)}
                className="w-full py-3 bg-zk-yellow text-black font-black text-xl rounded-lg shadow-md border-2 border-black hover:bg-yellow-400 active:translate-y-0.5 transition-all"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
