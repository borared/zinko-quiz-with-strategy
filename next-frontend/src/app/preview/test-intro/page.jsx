"use client";
import React, { useState } from 'react';
import QuestionIntroOverlay from '@/components/Play/QuestionIntroOverlay';

export default function TestIntroPage() {
  const [key, setKey] = useState(0);
  const [complete, setComplete] = useState(false);

  const reset = () => {
    setComplete(false);
    setKey(prev => prev + 1);
  };

  return (
    <div className="w-full h-screen font-sans relative flex items-center justify-center bg-neutral-900">
      {!complete && (
        <QuestionIntroOverlay 
          key={key} 
          onComplete={() => setComplete(true)} 
        />
      )}
      {complete && (
        <div className="text-center z-10 flex flex-col items-center gap-6">
          <h1 className="text-4xl font-black text-white uppercase tracking-widest">
            Intro Finished!
          </h1>
          <button 
            onClick={reset}
            className="px-6 py-3 bg-[#FFCD29] text-black font-black border-[3px] border-black rounded-xl shadow-[4px_4px_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_#000] transition-all uppercase tracking-widest text-sm"
          >
            Replay Intro
          </button>
        </div>
      )}
    </div>
  );
}
