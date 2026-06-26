"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocketStore } from '@/store/useSocketStore';
import { motion } from 'framer-motion';
import api from '../../services/api';

const EnterPinSection = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const router = useRouter();
  const { disconnectSocket } = useSocketStore();

  React.useEffect(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // only allow numbers
    if (value.length <= 6) {
      setPin(value);
      setError(''); // clear error on new input
    }
  };

  const handleEnter = async () => {
    if (pin.length < 6) {
      setError('Please enter a full 6-digit PIN.');
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Validate PIN with backend
      const data = await api.get(`/api/game/${pin}`);

      if (!data.valid) {
        setError(data.message || 'Invalid PIN. Please try again.');
        triggerShake();
        return;
      }

      if (data.playerCount >= 8) {
        setError('This game room is already full (max 8 players).');
        triggerShake();
        return;
      }

      if (data.phase !== 'LOBBY') {
        setError('This game has already started. Ask the host for a new PIN.');
        triggerShake();
        return;
      }

      // Store PIN for use in the next steps
      sessionStorage.setItem('game_pin', pin);

      // 🎵 Play the success sound
      window.gameAudio = new Audio('/audio/n2kstudio-music-for-game-fun-kid-game-163649.mp3');
      window.gameAudio.loop = true;
      window.gameAudio.play().catch(() => { }); // handle autoplay block silently
      window.dispatchEvent(new Event('audioStarted'));

      setTimeout(() => {
        router.push(`/play/${pin}/join-nickname`);
      }, 500);

    } catch (err) {
      setError('Game not found. Check your PIN and try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-zk-yellow w-full py-20 px-4 font-sans">

      {/* Decorative Elements */}
      <div className="absolute top-12 left-12 md:top-24 md:left-32 w-16 h-16 md:w-24 md:h-24 rounded-full border-[3px] border-black/10 bg-black/5 pointer-events-none" />
      <div className="absolute bottom-24 right-12 md:bottom-32 md:right-32 w-20 h-20 md:w-32 md:h-32 rotate-45 border-[3px] border-black/10 bg-black/5 pointer-events-none" />

      {/* Main Content */}
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative z-10 w-full max-w-[500px] flex flex-col items-center"
      >

        {/* Title */}
        <div className="text-center mb-8 permanent-marker-regular">
          <h2 className="text-4xl md:text-5xl font-bold text-zk-black mb-2 uppercase tracking-wide">
            Join
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-zk-black uppercase tracking-wide">
            Enter 6 Digit Number
          </h3>
        </div>

        {/* Card */}
        <motion.div
          animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-white border-[4px] border-zk-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 flex flex-col gap-4 rounded-xl"
        >

          {/* Input Box */}
          <div className="w-full">
            <input
              id="pin-input"
              type="text"
              value={pin}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
              placeholder="0 0 0 0 0 0"
              disabled={loading}
              className="w-full border-[3px] border-zk-black p-4 text-center text-3xl md:text-4xl tracking-[0.3em] md:tracking-[0.5em] font-bold text-zk-black placeholder-gray-200 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all rounded-xl disabled:opacity-60"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-center text-sm font-bold text-red-500 border-[2px] border-red-300 bg-red-50 py-2 px-4 rounded-lg">
              {error}
            </p>
          )}

          {/* Enter Button */}
          <motion.button
            id="enter-pin-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95, y: 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            onClick={handleEnter}
            disabled={loading || pin.length < 6}
            className="w-full bg-[#5D3FD3] hover:bg-zk-blue text-white border-[3px] border-zk-black py-4 font-black text-4xl uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
            style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                Checking...
              </>
            ) : 'Enter'}
          </motion.button>

        </motion.div>

      </motion.div>
    </div>
  );
};

export default EnterPinSection;
