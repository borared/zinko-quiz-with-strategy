"use client";
import React from 'react';
import { useUser } from '@clerk/nextjs';

const WelcomeBanner = ({ totalQuizzes = 0 }) => {
  const { user } = useUser();
  const firstName = user?.firstName || 'Majora';

  return (
    <div
      className="relative border-[3px] border-zk-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: 'url("https://res.cloudinary.com/dicrvjstp/image/upload/v1779612934/bg_welcome_1_xv1lps.png")' }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 flex flex-col gap-2">
        <h1 className="font-black text-4xl text-white tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,1)] [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]">Welcome back, {firstName}!</h1>
        <p className="font-['Amatic_SC'] text-3xl text-white font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,1)] [text-shadow:1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]">Ready to spark some curiosity today? Your students are waiting for their next challenge.</p>
      </div>

      {/* Stats Cards */}
      <div className="relative z-10 flex gap-6 mt-8">
        {/* Card 1 */}
        <div className="bg-[#7C4DFF] border-[3px] border-zk-black p-6 flex flex-col gap-1 w-64 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white rounded-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Games Created</p>
          <p className="text-5xl font-black">{totalQuizzes}</p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#FF6B4A] border-[3px] border-zk-black p-6 flex flex-col gap-1 w-64 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white rounded-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Players</p>
          <p className="text-5xl font-black">30</p>
        </div>


      </div>
    </div>
  );
};

export default WelcomeBanner;
