"use client";
import React, { useState, useEffect } from 'react';
import { Rocket, VenetianMask, RefreshCw, Edit2, Target, Puzzle, Crown, Sparkles, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import AvatarSelector from './AvatarSelector';
import { useSocketStore } from '@/store/useSocketStore';
import { useToastStore } from '@/store/useToastStore';
import api from '../../services/api';


// Module-level cache to make avatar loading instant on subsequent loads
let cachedAvatars = null;

const EnterNicknameSection = () => {
  const [nickname, setNickname] = useState('');
  const [avatars, setAvatars] = useState(cachedAvatars || []);
  const [selectedAvatar, setSelectedAvatar] = useState(
    cachedAvatars && cachedAvatars.length > 0
      ? cachedAvatars[Math.floor(Math.random() * cachedAvatars.length)]
      : null
  );
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loadingAvatars, setLoadingAvatars] = useState(!cachedAvatars);
  const router = useRouter();
  const { pin } = useParams();

  const { getSocket } = useSocketStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    if (!pin) {
      router.push('/join');
      return;
    }

    const validatePin = async () => {
      try {
        const gameRes = await api.get(`/api/game/${pin}`);
        if (!gameRes?.valid) {
          showToast(gameRes?.message || 'Invalid PIN. Please try again.', 'error');
          router.replace('/join');
          return;
        }
        if (gameRes.playerCount >= 8) {
          showToast('This game room is already full (max 8 players).', 'error');
          router.replace('/join');
          return;
        }
        if (gameRes.phase !== 'LOBBY') {
          showToast('This game has already started. Ask the host for a new PIN.', 'error');
          router.replace('/join');
          return;
        }
      } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || 'Game not found. Check your PIN.';
        showToast(errorMessage, 'error');
        router.replace('/join');
      }
    };
    validatePin();
  }, [pin, router, showToast]);

  useEffect(() => {
    if (cachedAvatars) return;

    const loadAvatars = async () => {
      try {
        const avatarRes = await api.get('/api/avatars');
        const data = avatarRes?.data || avatarRes;
        const success = avatarRes?.success !== false;

        if (success && Array.isArray(data) && data.length > 0) {
          cachedAvatars = data;
          setAvatars(data);
          setSelectedAvatar(data[Math.floor(Math.random() * data.length)]);
          
          // Preload avatar images for instant display when modal opens
          data.forEach(avatar => {
            if (avatar.image_url && typeof window !== 'undefined') {
              const img = new window.Image();
              img.src = avatar.image_url;
            }
          });
        }
      } catch (e) {
        console.error('Failed to load avatars', e);
      } finally {
        setLoadingAvatars(false);
      }
    };
    loadAvatars();
  }, []);

  const [isJoining, setIsJoining] = useState(false);

  const handleEnter = () => {
    if (isJoining || loadingAvatars) return;

    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length === 0) {
      setError('Please enter a nickname!');
      return;
    }
    if (trimmedNickname.length > 15) {
      setError('Nickname must be 15 characters or less.');
      return;
    }
    const NICKNAME_PATTERN = /^[a-zA-Z0-9 _-]+$/;
    if (!NICKNAME_PATTERN.test(trimmedNickname)) {
      setError('Invalid nickname. Use letters, numbers, spaces, hyphens, or underscores.');
      return;
    }
    setError('');
    setIsJoining(true);

    // Ensure session storage holds the correct pin in case they jumped straight here
    sessionStorage.setItem('game_pin', pin);

    if (pin) {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('lobby:check-nickname', { pin, nickname: trimmedNickname }, (response) => {
          if (response?.available) {
            sessionStorage.setItem('player_nickname', trimmedNickname);
            sessionStorage.setItem('player_avatar', selectedAvatar?.image_url || '');
            router.push(`/play/${pin}/choose-team`);
          } else {
            setError(response?.message || 'Nickname already taken');
            showToast(response?.message || 'Nickname already taken', 'error');
            setIsJoining(false);
          }
        });
      } else {
        sessionStorage.setItem('player_nickname', trimmedNickname);
        sessionStorage.setItem('player_avatar', selectedAvatar?.image_url || '');
        router.push(`/play/${pin}/choose-team`);
      }
    } else {
      router.push('/join');
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden bg-zk-bg px-4 py-20 font-sans">

      {/* Decorative Elements - Strategy / Quiz Theme */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [-15, 15, -15] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 left-16 md:top-24 md:left-32 text-black/10 pointer-events-none"
      >
        <Target size={90} strokeWidth={1.5} />
      </motion.div>
      
      <motion.div
        animate={{ y: [15, -15, 15], rotate: [0, 360] }}
        transition={{ y: { duration: 7, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 25, repeat: Infinity, ease: "linear" } }}
        className="absolute bottom-24 right-12 md:bottom-32 md:right-32 text-black/10 pointer-events-none"
      >
        <Puzzle size={110} strokeWidth={1.5} />
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-16 text-black/10 pointer-events-none hidden md:block"
      >
        <Crown size={80} strokeWidth={1.5} />
      </motion.div>

      <motion.div
        animate={{ y: [-15, 15, -15], rotate: [-25, 25, -25] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/3 left-12 text-black/10 pointer-events-none hidden md:block"
      >
        <Sparkles size={85} strokeWidth={1.5} />
      </motion.div>

      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative z-10 w-full max-w-[500px] flex flex-col items-center"
      >

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-black italic text-zk-text mb-1 uppercase tracking-tight permanent-marker-regular">
            Get in the game!
          </h2>
          <p className="text-base font-bold text-zk-text/70">
            Your squad is waiting for you.
          </p>
        </div>

        {/* Selected Avatar Display */}
        {loadingAvatars || !selectedAvatar ? (
          <div className="relative mb-6 w-40 h-40 border-2 border-zk-border rounded-xl bg-zk-panel-bg/50 animate-pulse flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-zk-border border-t-transparent animate-spin" />
          </div>
        ) : (
          <div 
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative mb-6 w-40 h-40 border-2 border-zk-border rounded-xl bg-zk-panel-bg flex items-center justify-center cursor-pointer group hover:-translate-y-1 transition-transform"
          >
            <img
              src={selectedAvatar.image_url}
              alt="Your Avatar"
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Edit Badge */}
            <div className="absolute -top-3 -right-3 bg-zk-panel-bg text-zk-text p-2 rounded-full border-2 border-zk-border group-hover:scale-110 group-hover:bg-gray-100 transition-all z-20">
              <Edit2 size={18} strokeWidth={2.5} />
            </div>
          </div>
        )}

        {/* Card for inputs */}
        <div className="w-full flex flex-col items-center">

          {/* Input Group */}
          <div className="w-full mb-4">
            <label className="block text-sm font-black text-zk-text tracking-wider mb-2">
              Choose Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={15}
              placeholder="Type something cool..."
              className="w-full border-2 border-zk-border p-4 text-center text-sm md:text-base font-bold text-zk-text bg-zk-panel-bg placeholder-zk-text/40 focus:outline-none focus:ring-zk-blue/30 transition-all rounded-xl"
              onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="w-full flex items-center gap-2.5 px-4 py-3 mb-4 bg-[#FF4B4B] text-white border border-zk-border rounded-xl shadow-none"
              >
                <AlertCircle size={18} className="shrink-0" />
                <p className="font-bold text-xs md:text-sm tracking-tight flex-1 text-left leading-snug">
                  {error}
                </p>
                <button 
                  type="button"
                  onClick={() => setError('')} 
                  className="hover:scale-110 active:scale-95 transition-transform"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enter Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95, y: 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            onClick={handleEnter}
            className="w-full flex items-center justify-center gap-2 bg-[#5D3FD3] hover:bg-zk-blue text-white border-2 border-zk-border py-4 px-6 font-black text-base tracking-wider mb-6 rounded-xl transition-colors"
          >
            Enter <Rocket size={20} />
          </motion.button>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 mb-6">
            <div className="flex-1 h-[2px] bg-zk-border/20"></div>
            <span className="text-sm font-bold text-zk-text/40">Or</span>
            <div className="flex-1 h-[2px] bg-zk-border/20"></div>
          </div>

          {/* Bottom Actions */}
          <div className="w-full grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-zk-panel-bg hover:bg-zk-border/10 text-zk-text border-2 border-zk-border py-4 px-2 font-black text-xs md:text-sm tracking-wider rounded-xl transition-colors"
            >
              <VenetianMask size={18} /> Change Avatar
            </button>
            <button
              onClick={() => router.push('/join')}
              className="flex items-center justify-center gap-2 bg-zk-panel-bg hover:bg-zk-border/10 text-zk-text border-2 border-zk-border py-4 px-2 font-black text-xs md:text-sm tracking-wider rounded-xl transition-colors"
            >
              <RefreshCw size={18} /> New PIN
            </button>
          </div>

        </div>
      </motion.div>

      {/* Avatar Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
            <AvatarSelector
              avatars={avatars}
              selectedAvatar={selectedAvatar}
              onSelect={(avatar) => {
                setSelectedAvatar(avatar);
                setIsAvatarModalOpen(false);
              }}
              onClose={() => setIsAvatarModalOpen(false)}
            />
        )}
      </AnimatePresence>

    </div>
  );
};

export default EnterNicknameSection;
