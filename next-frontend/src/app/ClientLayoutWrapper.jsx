"use client";
import { useEffect } from 'react';
import SoundToggle from '@/components/global/SoundToggle';
import Navbar from '@/components/global/Navbar';
import Footer from '@/components/global/Footer';
import AuthSync from '@/components/Authentication/AuthSync';
import ToastContainer from '@/components/global/ToastContainer';
import { usePathname } from 'next/navigation';

import CustomCursor from '@/components/global/CustomCursor';
import { useButtonClickSound } from '@/hooks/useButtonClickSound';

const NO_NAVBAR_PATHS = [
  "/sso-callback",
];

const GAME_FLOW_PATHS = [
  "/join",
  "/create-game",
  "/dashboard",
  "/discovery",
  "/shop",
  "/library",
  "/host",
  "/play",
  "/create-picture-race",
];

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  useButtonClickSound();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Preload heavy lobby background scenery images in background
    const imagesToPreload = [
      'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/city.jpg',
      'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/halloween_scenery.jpg',
      'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/inside_scenery.jpg',
      'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/ghost_station.jpg'
    ];
    imagesToPreload.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });

    // Preload scenery ambience audio tracks
    const audiosToPreload = [
      '/audio/halloween-ambience.mp3',
      '/audio/inside-ambience.mp3'
    ];
    audiosToPreload.forEach((src) => {
      const audio = new window.Audio();
      audio.src = src;
      audio.preload = 'auto';
    });
  }, []);
  
  const isFullScreen = pathname.startsWith("/host/") || pathname.startsWith("/play/");
  const showNavbar = !NO_NAVBAR_PATHS.includes(pathname) && !isFullScreen;
  const isGameFlow = GAME_FLOW_PATHS.some((p) => pathname.startsWith(p));
  const showFooter = !isGameFlow && !isFullScreen;

  return (
    <>
      <CustomCursor />
      <AuthSync />
      <SoundToggle />
      <ToastContainer />
      {showNavbar && <Navbar />}
      <main className={`flex-1 flex flex-col ${showNavbar ? "pt-[76px]" : ""}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
}
