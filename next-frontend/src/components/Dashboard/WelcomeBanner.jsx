"use client";
import React from 'react';
import { useUser } from '@clerk/nextjs';

const WelcomeBanner = () => {
  const { user } = useUser();
  const firstName = user?.firstName || 'Player';

  return (
    <div
      className="relative zk-panel !shadow-none overflow-hidden w-full min-h-[220px] md:min-h-[280px]"
      style={{
        backgroundImage:
          'url("https://res.cloudinary.com/dicrvjstp/image/upload/v1779612934/bg_welcome_1_xv1lps.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-zk-black/90 via-zk-black/70 to-zk-black/35" />

      <div className="relative z-10 w-full h-full min-h-[inherit] p-6 md:p-10 flex flex-col justify-center gap-3 md:gap-4">
        <p
          className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-zk-yellow"
          style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}
        >
          Command Center
        </p>
        <h1
          className="font-black text-3xl md:text-5xl text-white tracking-tight leading-tight"
          style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.85)' }}
        >
          Welcome back, {firstName}!
        </h1>
        <p
          className="text-white text-xl md:text-3xl font-bold w-full leading-snug max-w-2xl"
          style={{
            fontFamily: 'var(--font-amatic-sc)',
            letterSpacing: '1px',
            textShadow: '2px 2px 0 rgba(0,0,0,0.85)',
          }}
        >
          Your quizzes are loaded and ready. Pick one to host or build something new.
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;