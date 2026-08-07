"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX } from 'lucide-react';

const SoundToggle = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  useEffect(() => {
    // Check if audio is already playing (e.g. if component mounts after audio started)
    if (typeof window !== 'undefined' && window.gameAudio) {
      setHasAudio(true);
      if (!window.gameAudio.paused) {
        setIsPlaying(true);
      }
    }

    const handleAudioStart = () => {
      setHasAudio(true);
      setIsPlaying(true);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('audioStarted', handleAudioStart);
      return () => window.removeEventListener('audioStarted', handleAudioStart);
    }
  }, []);

  const toggleSound = () => {
    if (typeof window !== 'undefined' && window.gameAudio) {
      if (isPlaying) {
        window.gameAudio.pause();
      } else {
        window.gameAudio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const pathname = usePathname();

  useEffect(() => {
    const isHostRoute = pathname.startsWith('/host');

    // Stop audio on player routes and anywhere outside host lobby/game
    if (!isHostRoute) {
      if (typeof window !== 'undefined' && window.gameAudio) {
        window.gameAudio.pause();
        window.gameAudio.currentTime = 0;
        window.gameAudio = null;
      }
      setHasAudio(false);
      setIsPlaying(false);
    }
  }, [pathname]);

  // Host-only — players stay muted throughout the join/play flow
  if (!hasAudio || !pathname.startsWith('/host')) return null;

  return (
    <button
      onClick={toggleSound}
      className="fixed top-4 right-4 z-[100] bg-zk-panel-bg border-[3px] border-zk-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none rounded-xl"
      title={isPlaying ? "Mute Sound" : "Unmute Sound"}
    >
      {isPlaying ? <Volume2 size={24} className="text-zk-text" /> : <VolumeX size={24} className="text-zk-text" />}
    </button>
  );
};

export default SoundToggle;
