"use client";

import { useCallback, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import {
  getHalloweenAudio,
  isHalloweenAudioPlaying,
  toggleHalloweenAudio,
} from '@/lib/sceneryAudio';

export default function HalloweenSoundToggle({ visible = true, disabled = false, className = '' }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const refreshPlayingState = useCallback(() => {
    setIsPlaying(isHalloweenAudioPlaying());
  }, []);

  useEffect(() => {
    refreshPlayingState();

    const onAudioChange = () => refreshPlayingState();
    window.addEventListener('halloweenAudioChanged', onAudioChange);
    return () => window.removeEventListener('halloweenAudioChanged', onAudioChange);
  }, [refreshPlayingState, visible]);

  const handleToggle = () => {
    if (disabled) return;
    const playing = toggleHalloweenAudio();
    setIsPlaying(playing);
    if (!getHalloweenAudio()) refreshPlayingState();
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      aria-label={isPlaying ? 'Mute Halloween ambience' : 'Unmute Halloween ambience'}
      title={isPlaying ? 'Mute Halloween sound' : 'Play Halloween sound'}
      className={`flex items-center gap-2 bg-white border-[3px] border-[#000000] rounded-xl px-3 py-2 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
    >
      {isPlaying ? (
        <Volume2 size={22} strokeWidth={3} className="text-[#000000]" />
      ) : (
        <VolumeX size={22} strokeWidth={3} className="text-[#000000]" />
      )}
      <div className="flex flex-col items-start text-left">
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#000000]/70">
          Sound
        </span>
        <span className="text-sm font-black uppercase tracking-wide text-[#000000] leading-tight">
          Halloween
        </span>
      </div>
    </button>
  );
}