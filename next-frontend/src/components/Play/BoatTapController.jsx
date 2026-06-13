"use client";
import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '@/context/SocketContext';
import { useParams } from 'next/navigation';

export default function BoatTapController({ playerId }) {
  const { pin } = useParams();
  const { getSocket } = useSocket();
  const team = typeof window !== 'undefined' ? sessionStorage.getItem('player_team') || 'A' : 'A';
  const [scale, setScale] = useState(1);

  const handleTap = useCallback((e) => {
    // Prevent default touch behavior to avoid zooming/scrolling
    if (e.cancelable) e.preventDefault();
    
    // Animate button push
    setScale(0.9);
    setTimeout(() => setScale(1), 100);

    // Emit tap
    const socket = getSocket();
    if (socket) {
      socket.emit('player:tap-boat', { pin, team, playerId });
    }
  }, [pin, team, playerId, getSocket]);

  const bgColor = team === 'A' ? 'bg-zk-red' : 'bg-zk-blue';
  const shadowColor = team === 'A' ? 'shadow-[#991b1b]' : 'shadow-[#1e3a8a]';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-blue-900 bg-[url('/water-pattern.svg')] bg-cover relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20 bg-black pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center mb-12 text-center">
        <h1 className="text-4xl font-zk-bold text-white mb-2 drop-shadow-md">BOAT RACE!</h1>
        <p className="text-xl text-white font-zk-medium">Tap the button as fast as you can to row your boat!</p>
      </div>

      <motion.button
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onTouchStart={handleTap}
        onMouseDown={handleTap}
        className={`z-10 w-64 h-64 rounded-full ${bgColor} border-[6px] border-zk-black 
        ${shadowColor} shadow-[0_12px_0_0_var(--tw-shadow-color),_0_20px_20px_0_rgba(0,0,0,0.5)] 
        flex flex-col items-center justify-center active:translate-y-3 active:shadow-[0_0px_0_0_var(--tw-shadow-color),_0_8px_8px_0_rgba(0,0,0,0.5)]
        touch-none select-none`}
      >
        <span className="text-6xl mb-2 block select-none pointer-events-none" style={{ transform: "scaleX(-1)" }}>🦆</span>
        <span className="text-4xl font-zk-bold text-white tracking-wider select-none pointer-events-none">SWIM!</span>
      </motion.button>
      
    </div>
  );
}
