"use client";

import { useCallback, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import {
  getSceneryAudioConfig,
  getSceneryAudio,
  isSceneryAudioPlaying,
  toggleSceneryAudio,
} from '@/lib/sceneryAudio';

export default function ScenerySoundToggle({
  visible = true,
  disabled = false,
  scenerySlug = null,
  className = '',
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const config = scenerySlug ? getSceneryAudioConfig(scenerySlug) : null;

  const refreshPlayingState = useCallback(() => {
    setIsPlaying(isSceneryAudioPlaying());
  }, []);

  useEffect(() => {
    refreshPlayingState();

    const onAudioChange = () => refreshPlayingState();
    window.addEventListener('sceneryAudioChanged', onAudioChange);
    window.addEventListener('halloweenAudioChanged', onAudioChange);
    return () => {
      window.removeEventListener('sceneryAudioChanged', onAudioChange);
      window.removeEventListener('halloweenAudioChanged', onAudioChange);
    };
  }, [refreshPlayingState, visible, scenerySlug]);

  const handleToggle = () => {
    if (disabled) return;
    const playing = toggleSceneryAudio();
    setIsPlaying(playing);
    if (!getSceneryAudio()) refreshPlayingState();
  };

  if (!visible || !config) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      aria-label={isPlaying ? `Mute ${config.label} ambience` : `Unmute ${config.label} ambience`}
      title={isPlaying ? `Mute ${config.label} sound` : `Play ${config.label} sound`}
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
          {config.label}
        </span>
      </div>
    </button>
  );
}