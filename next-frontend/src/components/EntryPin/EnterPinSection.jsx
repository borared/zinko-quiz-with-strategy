"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocketStore } from '@/store/useSocketStore';
import { motion } from 'framer-motion';
import { Brain, Swords, Shield, Zap } from 'lucide-react';
import api from '../../services/api';

const EnterPinSection = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { disconnectSocket } = useSocketStore();

  React.useEffect(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPin = urlParams.get('pin');
      if (urlPin && urlPin.length === 6) {
        setPin(urlPin);
        validateAndJoin(urlPin);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // only allow numbers
    if (value.length <= 6) {
      setPin(value);
      setError(''); // clear error on new input
    }
  };

  const handleEnter = () => {
    validateAndJoin(pin);
  };

  const validateAndJoin = async (pinToJoin) => {
    const trimmedPin = pinToJoin.trim();
    if (trimmedPin.length < 6) {
      setError('Please enter a full 6-digit PIN.');
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Validate PIN with backend
      const data = await api.get(`/api/game/${trimmedPin}`);

      if (!data?.valid) {
        setError(data?.message || 'Invalid PIN. Please try again.');
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
      sessionStorage.setItem('game_pin', trimmedPin);

      // Players stay muted — no background music on join flow
      if (typeof window !== 'undefined' && window.gameAudio) {
        try {
          window.gameAudio.pause();
          window.gameAudio.currentTime = 0;
        } catch (e) {
          console.error('Failed to pause game audio:', e);
        } finally {
          window.gameAudio = null;
        }
      }

      router.push(`/play/${trimmedPin}/join-nickname`);

    } catch (err) {
      let errorMessage = err.response?.data?.message || err.message || 'Game not found. Check your PIN and try again.';
      // Clean up technical backend error messages for the user
      errorMessage = errorMessage.replace('API Error: Not Found: ', '');
      errorMessage = errorMessage.replace(/^API Error: [A-Za-z ]+: /, '');
      setError(errorMessage);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-zk-bg w-full py-20 px-4 font-sans">

      {/* Decorative Elements - Strategy / Quiz Theme */}
      <motion.div
        animate={{ y: [-15, 15, -15], rotate: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-12 left-12 md:top-24 md:left-32 text-black/10 pointer-events-none"
      >
        <Brain size={100} strokeWidth={1.5} />
      </motion.div>

      <motion.div
        animate={{ y: [15, -15, 15], rotate: [0, 360] }}
        transition={{ y: { duration: 7, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
        className="absolute bottom-24 right-12 md:bottom-32 md:right-32 text-black/10 pointer-events-none"
      >
        <Swords size={120} strokeWidth={1.5} />
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-12 text-black/10 pointer-events-none hidden md:block"
      >
        <Shield size={80} strokeWidth={1.5} />
      </motion.div>
      
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [-20, 20, -20] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-16 text-black/10 pointer-events-none hidden md:block"
      >
        <Zap size={90} strokeWidth={1.5} />
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative z-10 w-full max-w-[500px] flex flex-col items-center"
      >

        {/* Title */}
        <div className="text-center mb-8 permanent-marker-regular">
          <h2 className="text-4xl md:text-5xl font-bold text-zk-text mb-2 uppercase tracking-wide">
            Join
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-zk-text uppercase tracking-wide">
            Enter 6 Digit Number
          </h3>
        </div>

        {/* Card */}
        <motion.div
          animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-zk-panel-bg border-[4px] border-zk-border p-6 md:p-10 flex flex-col gap-4 rounded-xl"
        >

          {/* Input Box */}
          <div className="w-full relative">
            <input
              id="pin-input"
              type="text"
              value={pin}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={loading}
              maxLength={6}
              autoComplete="off"
              className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
            />
            {/* Visual Slots */}
            <div className="w-full border-[3px] border-zk-border p-3 md:p-4 rounded-xl flex items-center justify-between gap-2 md:gap-3 bg-zk-panel-bg focus-within:ring-4 focus-within:ring-zk-blue/30 transition-all">
              {[...Array(6)].map((_, i) => {
                const char = pin[i];
                const isFilled = char !== undefined;
                const isActive = isFocused && i === pin.length;
                return (
                  <div
                    key={i}
                    className={`relative flex-1 aspect-[3/4] max-h-16 md:max-h-20 flex items-center justify-center rounded-2xl md:rounded-[24px] transition-all ${
                      isFilled ? 'bg-zk-black' : 'bg-gray-200 dark:bg-zk-border/50'
                    } ${isActive ? 'ring-4 ring-[#5D3FD3] scale-[1.05] shadow-lg' : ''}`}
                  >
                    <span
                      className={`text-3xl md:text-5xl gasoek-one-regular leading-none ${
                        isFilled ? 'text-white' : 'text-white drop-shadow-sm'
                      }`}
                    >
                      {isFilled ? char : '0'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-center text-sm font-bold text-red-500 border-[2px] border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 py-2 px-4 rounded-lg">
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
            className="w-full bg-[#5D3FD3] hover:bg-zk-blue text-white border-[3px] border-zk-border py-4 font-black text-4xl uppercase tracking-wider transition-colors rounded-xl disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
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
