"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  clearSceneryAudioOnHostExit,
  resumeSceneryAudioForPin,
  syncSceneryAudioForImage,
} from '@/lib/sceneryAudio';
/** Keeps scenery ambience in sync with lobby background and host route lifecycle. */
export function useHalloweenSceneryAudio(sceneryImage, pin) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith('/host')) {
      clearSceneryAudioOnHostExit();
      return;
    }

    if (sceneryImage) {
      syncSceneryAudioForImage(sceneryImage, pin);
    }
  }, [sceneryImage, pin, pathname]);
}

/** Resume scenery audio on host game mount after lobby scenery selection. */
export function useResumeHalloweenAudio(pin) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith('/host') || !pin) return;
    resumeSceneryAudioForPin(pin);
  }, [pin, pathname]);

  useEffect(() => {
    if (!pathname.startsWith('/host')) {
      clearSceneryAudioOnHostExit();
    }
  }, [pathname]);
}