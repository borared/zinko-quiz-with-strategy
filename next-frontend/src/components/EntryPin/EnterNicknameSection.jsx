"use client";
import React, { useState, useEffect } from 'react';
import { Rocket, VenetianMask, RefreshCw, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
;
import AvatarSelector from './AvatarSelector';
import { useSocketStore } from '@/store/useSocketStore';
import { useToastStore } from '@/store/useToastStore';
import api from '../../services/api';


const EnterNicknameSection = () => {
  const [nickname, setNickname] = useState('');
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const router = useRouter();
  const { pin } = useParams();

  const { getSocket } = useSocketStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    if (!pin) {
      router.push('/join');
      return;
    }

    const validatePinAndLoadAvatars = async () => {
      try {
        // First validate the PIN
        const gameRes = await api.get(`/api/game/${pin}`);
        if (!gameRes || !gameRes.valid) {
          showToast(gameRes?.message || 'Invalid PIN. Please try again.', 'error');
          router.replace('/join');
          return;
        }
        if (gameRes.phase !== 'LOBBY') {
          showToast('This game has already started. Ask the host for a new PIN.', 'error');
          router.replace('/join');
          return;
        }

        // PIN is valid, now load avatars
        const { data, success } = await api.get('/api/avatars');
        if (success && Array.isArray(data) && data.length) {
          setAvatars(data);
          const random = data[Math.floor(Math.random() * data.length)];
          setSelectedAvatar(random);
        } else {
          console.error('Failed to load avatars', data);
        }
      } catch (e) {
        showToast('Game not found. Check your PIN.', 'error');
        router.replace('/join');
      } finally {
        setLoadingAvatars(false);
      }
    };
    validatePinAndLoadAvatars();
  }, [pin, router, showToast]);

  const handleEnter = () => {
    if (nickname.trim().length === 0) {
      setError('Please enter a nickname!');
      return;
    }
    setError('');

    // Ensure session storage holds the correct pin in case they jumped straight here
    sessionStorage.setItem('game_pin', pin);

    if (pin) {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('lobby:check-nickname', { pin, nickname: nickname.trim() }, (response) => {
          if (response && response.available) {
            sessionStorage.setItem('player_nickname', nickname.trim());
            sessionStorage.setItem('player_avatar', selectedAvatar?.image_url || '');
            router.push(`/play/${pin}/choose-team`);
          } else {
            setError(response?.message || 'Nickname already taken');
            showToast(response?.message || 'Nickname already taken', 'error');
          }
        });
      } else {
        sessionStorage.setItem('player_nickname', nickname.trim());
        sessionStorage.setItem('player_avatar', selectedAvatar?.image_url || '');
        router.push(`/play/${pin}/choose-team`);
      }
    } else {
      router.push('/join');
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden bg-zk-yellow px-4 py-20 font-sans">

      {/* Decorative Elements */}
      <motion.div
        animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 left-16 md:top-24 md:left-32 w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#D4A322]/40 border-[3px] border-zk-black/10 pointer-events-none"
      />
      <motion.div
        animate={{ y: [15, -15, 15], rotate: [45, 60, 45] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-24 right-12 md:bottom-32 md:right-32 w-20 h-20 md:w-32 md:h-32 rotate-45 bg-[#FFB020]/60 border-[3px] border-zk-black/10 pointer-events-none rounded-xl"
      />

      <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-black italic text-zk-black mb-1 uppercase tracking-tight permanent-marker-regular">
            Get in the game!
          </h2>
          <p className="text-base font-bold text-zk-black/70">
            Your squad is waiting for you.
          </p>
        </div>

        {/* Selected Avatar Display */}
        {loadingAvatars ? (
          <p className="text-sm text-zk-black/70 mb-6">Loading avatars…</p>
        ) : selectedAvatar ? (
          <div 
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative mb-6 w-40 h-40 border-[4px] border-zk-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl bg-white flex items-center justify-center cursor-pointer group hover:-translate-y-1 hover:shadow-[6px_10px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <img
              src={selectedAvatar.image_url}
              alt="Your Avatar"
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Edit Badge */}
            <div className="absolute -top-3 -right-3 bg-white text-zk-black p-2 rounded-full border-[3px] border-zk-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 group-hover:bg-gray-100 transition-all z-20">
              <Edit2 size={18} strokeWidth={2.5} />
            </div>
          </div>
        ) : null}

        {/* Card for inputs */}
        <div className="w-full flex flex-col items-center">

          {/* Input Group */}
          <div className="w-full mb-4">
            <label className="block text-sm font-black text-zk-black uppercase tracking-wider mb-2">
              Choose Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="TYPE SOMETHING COOL..."
              className="w-full border-[3px] border-zk-black p-4 text-center text-sm md:text-base font-bold text-zk-black placeholder-black focus:outline-none focus:ring-zk-blue/30 transition-all rounded-xl"
              onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 font-bold text-sm mb-4 w-full text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Enter Button */}
          <button
            onClick={handleEnter}
            className="w-full flex items-center justify-center gap-2 bg-[#5D3FD3] hover:bg-zk-blue text-white border-[3px] border-zk-black py-4 px-6 font-black text-base uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none mb-6 rounded-xl"
          >
            Enter <Rocket size={20} />
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 mb-6">
            <div className="flex-1 h-[2px] bg-zk-black/10"></div>
            <span className="text-sm font-bold text-zk-black/40 uppercase">Or</span>
            <div className="flex-1 h-[2px] bg-zk-black/10"></div>
          </div>

          {/* Bottom Actions */}
          <div className="w-full grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-zk-black border-[3px] border-zk-black py-4 px-2 font-black text-xs md:text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none rounded-xl"
            >
              <VenetianMask size={18} /> Change Avatar
            </button>
            <button
              onClick={() => router.push('/join')}
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-zk-black border-[3px] border-zk-black py-4 px-2 font-black text-xs md:text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none rounded-xl"
            >
              <RefreshCw size={18} /> New PIN
            </button>
          </div>

        </div>
      </div>

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
