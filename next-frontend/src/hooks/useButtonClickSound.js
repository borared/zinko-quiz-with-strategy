"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const CLICK_SOUND_SRC = '/audio/clicksound.mp3';

const PLAYER_ROUTE_PREFIXES = ['/play', '/join'];

function isPlayerRoute(pathname) {
  return PLAYER_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isInteractiveTarget(target) {
  if (!(target instanceof Element)) return false;

  return !!(
    target.closest('button, a, [role="button"]') ||
    target.closest('[data-click-sound]') ||
    window.getComputedStyle(target).cursor === 'pointer'
  );
}

export function useButtonClickSound() {
  const pathname = usePathname();
  const audioRef = useRef(null);

  useEffect(() => {
    if (isPlayerRoute(pathname) || !pathname.startsWith('/host')) return;

    const audio = new Audio(CLICK_SOUND_SRC);
    audio.volume = 0.6;
    audioRef.current = audio;

    const handlePointerDown = (event) => {
      if (!isInteractiveTarget(event.target)) return;

      const clip = audioRef.current;
      if (!clip) return;

      clip.currentTime = 0;
      clip.play().catch(() => {});
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      audioRef.current = null;
    };
  }, [pathname]);
}