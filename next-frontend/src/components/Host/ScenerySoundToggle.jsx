"use client";

import { useCallback, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import {
  getSceneryAudioConfig,
  getSceneryAudio,
  isSceneryAudioMuted,
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
    setIsPlaying(!isSceneryAudioMuted());
  }, []);

  useEffect(() => {
    refreshPlayingState();

    const onAudioChange = () => refreshPlayingState();
    window.addEventListener('sceneryAudioChanged', onAudioChange);
    window.addEventListener('halloweenAudioChanged', onAudioChange);
    window.addEventListener('gameAudioChanged', onAudioChange);
    return () => {
      window.removeEventListener('sceneryAudioChanged', onAudioChange);
      window.removeEventListener('halloweenAudioChanged', onAudioChange);
      window.removeEventListener('gameAudioChanged', onAudioChange);
    };
  }, [refreshPlayingState, visible, scenerySlug]);

  const handleToggle = () => {
    if (disabled) return;
    const playing = toggleSceneryAudio();
    setIsPlaying(playing);
    if (!getSceneryAudio()) refreshPlayingState();
  };

  if (!visible) return null;

  // Fallback config so the button stays rendered during game phases
  const displayConfig = config || { label: 'Game' };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      aria-label={isPlaying ? `Mute ${displayConfig.label} music` : `Unmute ${displayConfig.label} music`}
      title={isPlaying ? `Mute ${displayConfig.label} music` : `Play ${displayConfig.label} music`}
      className={`flex items-center justify-center bg-zk-panel-bg border-[3px] border-[#000000] rounded-xl p-3 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
    >
      {isPlaying ? (
        <Volume2 size={24} strokeWidth={3} className="text-[#000000]" />
      ) : (
        <VolumeX size={24} strokeWidth={3} className="text-[#000000]" />
      )}
    </button>
  );
}