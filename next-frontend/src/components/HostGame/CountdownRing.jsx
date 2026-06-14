"use client";
import React from 'react';

export default function CountdownRing({ timeLeft }) {
  return (
    <div className={`rounded-2xl px-8 py-3 font-black border-[4px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-colors flex items-center justify-center ${
      timeLeft <= 5 ? 'bg-[#E74C3C] text-white' :
      timeLeft <= 10 ? 'bg-[#F39C12] text-white' :
      'bg-zk-black text-white'
    }`} style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '3.5rem', letterSpacing: '2px', paddingTop: '10px', minWidth: '96px', textAlign: 'center' }}>
      {timeLeft}
    </div>
  );
}
