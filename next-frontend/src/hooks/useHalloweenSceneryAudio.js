"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  clearHalloweenAudioOnHostExit,
  resumeHalloweenAudioForPin,
  syncHalloweenAudioForScenery,
} from '@/lib/sceneryAudio';
/** Keeps Halloween ambience in sync with scenery and host route lifecycle. */
export function useHalloweenSceneryAudio(sceneryImage, pin) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith('/host')) {
      clearHalloweenAudioOnHostExit();
      return;
    }

    if (sceneryImage) {
      syncHalloweenAudioForScenery(sceneryImage, pin);
    }
  }, [sceneryImage, pin, pathname]);
}

/** Resume Halloween audio on host game mount after lobby scenery selection. */
export function useResumeHalloweenAudio(pin) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith('/host') || !pin) return;
    resumeHalloweenAudioForPin(pin);
  }, [pin, pathname]);

  useEffect(() => {
    if (!pathname.startsWith('/host')) {
      clearHalloweenAudioOnHostExit();
    }
  }, [pathname]);
}