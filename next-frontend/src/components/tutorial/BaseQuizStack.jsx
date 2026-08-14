"use client";

import React, { useState } from 'react';

export default function BaseQuizStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [exitIndex, setExitIndex] = useState(null);

  const cards = [
    'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/tutorial/basic1.png',
    'https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/tutorial/basic2.png',
  ];

  const handleNext = (e) => {
    e.stopPropagation();
    if (exitIndex !== null) return; // Prevent double clicks
    
    setExitIndex(activeIndex);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
      setExitIndex(null);
    }, 300);
  };

  return (
    <div 
      onClick={handleNext}
      className="relative w-full h-full cursor-pointer flex items-center justify-center select-none min-h-[300px]"
    >
      {cards.map((src, index) => {
        const relativeIndex = (index - activeIndex + cards.length) % cards.length;
        const isExiting = index === exitIndex;

        // Visual stack states
        let zIndex = 30 - relativeIndex * 10;
        let scale = 1 - relativeIndex * 0.05;
        let translateY = relativeIndex * 10;
        let rotate = relativeIndex === 0 ? 0 : relativeIndex === 1 ? 3 : -3;
        let opacity = 1;
        let translateX = 0;

        if (isExiting) {
          translateX = -35; // Shorter move left
          rotate = -8;      // Subtle rotation
          scale = 0.95;
          zIndex = 40;
        }

        return (
          <div
            key={src}
            style={{
              zIndex,
              transform: `translate3d(${translateX}%, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`,
              opacity,
              transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease',
            }}
            className="absolute w-full h-full border border-zk-border rounded-2xl overflow-hidden bg-zk-panel-bg shadow-[4px_4px_0_0_#000] p-4 flex items-center justify-center transition-colors duration-300 cursor-pointer"
          >
            <img 
              src={src} 
              alt={`Base Quiz ${index + 1}`} 
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
          </div>
        );
      })}

      {/* Click Hint Badge */}
      <div className="absolute bottom-4 right-4 z-50 bg-zk-purple text-zk-white px-3 py-1.5 rounded-lg border border-zk-border shadow-[2px_2px_0_0_#000] text-xs font-['Outfit'] font-black uppercase tracking-wider pointer-events-none animate-pulse">
        Click to swap 👆
      </div>
    </div>
  );
}
