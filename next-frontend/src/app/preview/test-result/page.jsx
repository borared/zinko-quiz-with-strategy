"use client";
import React, { useState } from 'react';
import ResultOverlay from '@/components/Play/ResultOverlay';

export default function TestResultPage() {
  const [isCorrect, setIsCorrect] = useState(false);
  const [stolenPoints, setStolenPoints] = useState(0);
  const [rabbitBonusApplied, setRabbitBonusApplied] = useState(false);

  const dummyResultData = {
    isCorrect,
    rabbitBonusApplied,
    pointsEarned: isCorrect ? (rabbitBonusApplied ? 1700 : 850) : 0,
    stolenPoints,
    totalScore: 12450
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ResultOverlay resultData={dummyResultData} />
      
      {/* Controls Overlay for easy testing */}
      <div className="absolute top-4 left-4 z-50 bg-white/95 p-4 rounded-xl border-[4px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3 font-sans">
        <h3 className="font-black text-xl border-b-2 border-black/10 pb-2">Result Preview Controls</h3>
        
        <button 
          onClick={() => setIsCorrect(!isCorrect)}
          className={`px-4 py-2 font-bold border-2 border-black rounded hover:opacity-80 transition-opacity ${isCorrect ? 'bg-green-400 text-black' : 'bg-red-400 text-white'}`}
        >
          State: {isCorrect ? '✅ Correct' : '❌ Incorrect'}
        </button>
        
        <button 
          onClick={() => setStolenPoints(stolenPoints === 0 ? 500 : (stolenPoints > 0 ? -300 : 0))}
          className="px-4 py-2 font-bold border-2 border-black rounded bg-zk-yellow text-black hover:opacity-80 transition-opacity"
        >
          Frog Skill: {stolenPoints === 0 ? 'None' : (stolenPoints > 0 ? `+${stolenPoints} (You Stole)` : `${stolenPoints} (Got Stolen)`)}
        </button>
        
        <button 
          onClick={() => setRabbitBonusApplied(!rabbitBonusApplied)}
          className={`px-4 py-2 font-bold border-2 border-black rounded hover:opacity-80 transition-opacity ${rabbitBonusApplied ? 'bg-purple-400 text-white' : 'bg-gray-200 text-black'}`}
        >
          Rabbit Bonus: {rabbitBonusApplied ? 'ON (2x)' : 'OFF'}
        </button>

      </div>
    </div>
  );
}
