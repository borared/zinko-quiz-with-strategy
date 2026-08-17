import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketStore } from '@/store/useSocketStore';
import { Send } from 'lucide-react';

export default function DrawItPlayer({ pin, playerId, winnerTeam, winnerNickname, word, teamNames, isLeader }) {
  const canvasRef = useRef(null);
  const { getSocket, isConnected } = useSocketStore();
  const [guess, setGuess] = useState("");
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);
  const [closenessScore, setClosenessScore] = useState(0);
  const [lastGuess, setLastGuess] = useState("");

  // Handle resizing of canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight || 400; // default height
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Listen for socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected) return;

    const onStroke = ({ stroke }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      
      ctx.beginPath();
      ctx.moveTo(stroke.start.x * canvas.width, stroke.start.y * canvas.height);
      ctx.lineTo(stroke.end.x * canvas.width, stroke.end.y * canvas.height);
      ctx.strokeStyle = stroke.color || '#000000';
      ctx.lineWidth = stroke.width || 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    };

    const onClear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const onRoundStart = () => {
      onClear();
      setHasGuessedCorrectly(false);
      setGuess("");
      setClosenessScore(0);
      setLastGuess("");
    };

    const onGuessFeedback = ({ score, guess: evaluatedGuess }) => {
      setClosenessScore(score);
      setLastGuess(evaluatedGuess);
      setTimeout(() => setClosenessScore(0), 4000);
    };

    socket.on('game:draw-it-stroke', onStroke);
    socket.on('game:draw-it-clear', onClear);
    socket.on('game:draw-it-round-start-player', onRoundStart);
    socket.on('game:draw-it-guess-feedback', onGuessFeedback);

    return () => {
      socket.off('game:draw-it-stroke', onStroke);
      socket.off('game:draw-it-clear', onClear);
      socket.off('game:draw-it-round-start-player', onRoundStart);
      socket.off('game:draw-it-guess-feedback', onGuessFeedback);
    };
  }, [getSocket, isConnected]);

  const handleGuess = (e) => {
    e.preventDefault();
    if (!guess.trim() || hasGuessedCorrectly || winnerTeam) return;

    const socket = getSocket();
    if (socket && isConnected) {
      socket.emit('player:draw-it-guess', { pin, playerId, guess: guess.trim() });
    }
    setGuess("");
  };

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col p-4 sm:p-6">
      
      {/* Title */}
      <h2 
        className="text-3xl font-black text-white uppercase text-center mb-4 zinko-font"
        style={{ WebkitTextStroke: '2px #1a1a1a' }}
      >
        Guess the Drawing!
      </h2>

      {/* Canvas Container */}
      <div className="relative w-full flex-1 max-h-[500px] bg-zk-panel-bg border-[4px] border-[#000000] rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
        
        {/* Winner Overlay */}
        <AnimatePresence>
          {winnerTeam && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center z-20"
            >
              <h3 className="text-zk-yellow font-black text-3xl uppercase mb-2">Round Over!</h3>
              <p className="text-white font-black text-xl">
                <span className="text-zk-blue">Team {teamNames?.[winnerTeam] || winnerTeam}</span> got it!
              </p>
              <p className="text-gray-300 font-bold mt-1 text-sm uppercase">{winnerNickname} guessed the word.</p>
              
              {word && (
                <div className="mt-4 bg-zk-panel-bg border-[3px] border-[#000000] rounded-xl px-6 py-2">
                  <span className="text-black font-black text-2xl uppercase tracking-widest">{word}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Form or Leader message */}
      <div className="mt-4 mb-2 relative z-30">
        {isLeader ? (
          <form onSubmit={handleGuess} className="flex items-center gap-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={winnerTeam !== null || hasGuessedCorrectly}
              placeholder={winnerTeam ? "Round Over..." : "Type your guess..."}
              className="flex-1 bg-zk-panel-bg border-[3px] border-[#000000] rounded-xl px-4 py-3 font-black text-lg text-black placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={!guess.trim() || winnerTeam !== null}
              className="bg-zk-blue disabled:bg-gray-400 disabled:shadow-none hover:bg-[#5D3FD3] text-white border-[3px] border-[#000000] rounded-xl px-6 py-3 font-black uppercase shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
            >
              <Send size={20} strokeWidth={3} />
            </button>
          </form>
        ) : (
          <div className="bg-[#1A1A24]/60 border-[3px] border-black rounded-xl p-3 text-center">
            <p className="text-zk-yellow font-black uppercase tracking-widest text-lg font-sans">
              Waiting for Leader to guess...
            </p>
            <p className="text-white/80 font-bold text-xs mt-0.5">
              Only the Team Leader can submit guesses for your team.
            </p>
          </div>
        )}
      </div>

      {/* Closeness Progress Bar */}
      <AnimatePresence>
        {closenessScore > 0 && !winnerTeam && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 10 }}
            className="mb-2 px-1"
          >
            <div className="flex justify-between items-end mb-1">
              <span className="text-white font-bold text-sm uppercase tracking-wide drop-shadow-md">
                "{lastGuess}" is {closenessScore >= 90 ? 'very close!' : 'getting warm...'}
              </span>
              <span className="text-white font-black text-sm drop-shadow-md">{closenessScore}%</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-3 border-2 border-[#000000] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${closenessScore}%` }}
                className={`h-full ${closenessScore >= 90 ? 'bg-[#ff3b3b]' : closenessScore >= 70 ? 'bg-[#ff9d00]' : 'bg-[#00c3ff]'}`}
                transition={{ type: "spring", stiffness: 50 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
