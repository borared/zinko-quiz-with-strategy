import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketStore } from '@/store/useSocketStore';
import { Send } from 'lucide-react';

export default function DrawItPlayer({ pin, playerId, winnerTeam, winnerNickname, word, teamNames }) {
  const canvasRef = useRef(null);
  const { getSocket, isConnected } = useSocketStore();
  const [guess, setGuess] = useState("");
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);

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
    };

    socket.on('game:draw-it-stroke', onStroke);
    socket.on('game:draw-it-clear', onClear);
    socket.on('game:draw-it-round-start-player', onRoundStart);

    return () => {
      socket.off('game:draw-it-stroke', onStroke);
      socket.off('game:draw-it-clear', onClear);
      socket.off('game:draw-it-round-start-player', onRoundStart);
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
    <div className="relative w-full h-full min-h-[400px] flex flex-col pt-4">
      
      {/* Title */}
      <h2 
        className="text-3xl font-black text-white uppercase text-center mb-4 zinko-font"
        style={{ WebkitTextStroke: '2px #1a1a1a' }}
      >
        Guess the Drawing!
      </h2>

      {/* Canvas Container */}
      <div className="relative w-full flex-1 max-h-[500px] bg-white border-[4px] border-[#000000] rounded-xl shadow-[6px_6px_0_0_#000] overflow-hidden">
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
                <div className="mt-4 bg-white border-[3px] border-[#000000] rounded-xl px-6 py-2">
                  <span className="text-black font-black text-2xl uppercase tracking-widest">{word}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Form */}
      <div className="mt-4 mb-2 relative z-30">
        <form onSubmit={handleGuess} className="flex items-center gap-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={winnerTeam !== null || hasGuessedCorrectly}
            placeholder={winnerTeam ? "Round Over..." : "Type your guess..."}
            className="flex-1 bg-white border-[3px] border-[#000000] rounded-xl px-4 py-3 font-black text-lg text-black placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-white/50"
          />
          <button
            type="submit"
            disabled={!guess.trim() || winnerTeam !== null}
            className="bg-zk-blue disabled:bg-gray-400 disabled:shadow-none hover:bg-[#5D3FD3] text-white border-[3px] border-[#000000] rounded-xl px-6 py-3 font-black uppercase shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
          >
            <Send size={20} strokeWidth={3} />
          </button>
        </form>
      </div>
    </div>
  );
}
