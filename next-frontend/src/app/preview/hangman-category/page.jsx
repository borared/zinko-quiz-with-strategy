"use client";
import React from 'react';
import HangmanCategoryPicker from '@/components/HostGame/HangmanCategoryPicker';

export default function PreviewHangmanCategory() {
  return (
    <div 
      className="min-h-screen flex flex-col overflow-hidden relative font-sans bg-[#181824]"
      style={{
        backgroundImage: "url('/background_battle/background_hangman.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45 pointer-events-none z-0" />
      <HangmanCategoryPicker 
        onSelectCategory={(category) => alert(`Selected category: ${category}`)} 
      />
    </div>
  );
}
