import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const SoundToggle = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Check if audio is already playing (e.g. if component mounts after audio started)
    if (window.gameAudio && !window.gameAudio.paused) {
      setIsPlaying(true);
    }

    const handleAudioStart = () => setIsPlaying(true);
    window.addEventListener('audioStarted', handleAudioStart);
    return () => window.removeEventListener('audioStarted', handleAudioStart);
  }, []);

  const toggleSound = () => {
    if (window.gameAudio) {
      if (isPlaying) {
        window.gameAudio.pause();
      } else {
        window.gameAudio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Only show the button if the audio object exists (meaning it has been initialized at least once)
  if (!window.gameAudio) return null;

  return (
    <button
      onClick={toggleSound}
      className="fixed top-4 right-4 z-[100] bg-zk-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
      title={isPlaying ? "Mute Sound" : "Unmute Sound"}
    >
      {isPlaying ? <Volume2 size={24} className="text-zk-black" /> : <VolumeX size={24} className="text-zk-black" />}
    </button>
  );
};

export default SoundToggle;
