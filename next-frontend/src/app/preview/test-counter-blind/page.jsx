"use client";
import React, { useState } from 'react';
import FoxSmokescreen from '@/components/Play/Skills/FoxSmokescreen';

export default function TestCounterBlindPage() {
  const [isActive, setIsActive] = useState(true);
  const [isLeader, setIsLeader] = useState(true);
  const [charges, setCharges] = useState(2);

  const handleCounterBlind = () => {
    setCharges(prev => Math.max(0, prev - 1));
    // Disperse smoke with a slight notification
    setIsActive(false);
  };

  return (
    <div className="w-full h-screen font-sans relative bg-zk-blue flex flex-col items-center justify-center p-6 text-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      <div className="relative z-10 max-w-lg w-full bg-black/20 border-4 border-dashed border-white/20 p-8 rounded-3xl backdrop-blur-sm shadow-2xl">
        <h2 
          className="text-4xl font-black mb-4 uppercase tracking-widest text-zk-yellow"
          style={{ fontFamily: 'var(--font-permanent-marker), cursive' }}
        >
          Counter Blind Test Room
        </h2>
        <p className="text-base opacity-80 mb-8 font-semibold">
          Use the control panel below to test the redesigned orange smokescreen and the new Counter Blind skill.
        </p>

        <div className="flex flex-col gap-4 text-left bg-black/50 border-2 border-white/10 p-6 rounded-2xl mb-8">
          <h3 className="font-bold text-zk-yellow text-xs uppercase tracking-wider mb-2">Controls</h3>
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">Blinded Status:</span>
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-colors ${isActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              {isActive ? 'BLINDED (Active)' : 'CLEAR (Inactive)'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">Player Role:</span>
            <button 
              onClick={() => setIsLeader(!isLeader)}
              className={`px-4 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-colors ${isLeader ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
            >
              {isLeader ? 'LEADER (Can Counter)' : 'MEMBER (No Button)'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">Counter Blind Charges:</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCharges(c => Math.max(0, c - 1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded font-black text-lg transition-colors border border-white/20"
              >
                -
              </button>
              <span className="font-black text-lg w-6 text-center">{charges}</span>
              <button 
                onClick={() => setCharges(c => c + 1)}
                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded font-black text-lg transition-colors border border-white/20"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs opacity-60">
          Tip: You can move your cursor around and click inside the test room even when blinded!
        </p>
      </div>

      {/* Smokescreen Overlay */}
      <FoxSmokescreen 
        isActive={isActive}
        isLeader={isLeader}
        teamCounterBlindCharges={charges}
        onCounterBlind={handleCounterBlind}
      />
    </div>
  );
}
