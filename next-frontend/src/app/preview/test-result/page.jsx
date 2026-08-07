"use client";
import React, { useState } from 'react';
import ResultOverlay from '@/components/Play/ResultOverlay';

const RESULT_STATES = ['correct', 'incorrect', 'missed'];

export default function TestResultPage() {
  const [resultState, setResultState] = useState('correct');
  const [stolenPoints, setStolenPoints] = useState(0);
  const [rabbitBonusApplied, setRabbitBonusApplied] = useState(false);

  const isCorrect = resultState === 'correct';
  const isMissed = resultState === 'missed';

  const dummyResultData = {
    isCorrect,
    isMissed,
    rabbitBonusApplied: isCorrect && rabbitBonusApplied,
    pointsEarned: isCorrect ? (rabbitBonusApplied ? 1700 : 850) : 0,
    stolenPoints,
    totalScore: 12450,
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ResultOverlay resultData={dummyResultData} />
      
      {/* Controls Overlay for easy testing */}
      <div className="absolute top-4 left-4 z-50 bg-zk-panel-bg/95 p-4 rounded-xl border-[4px] border-zk-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3 font-sans">
        <h3 className="font-black text-xl border-b-2 border-black/10 pb-2">Result Preview Controls</h3>
        
        <button 
          onClick={() => {
            const nextIndex = (RESULT_STATES.indexOf(resultState) + 1) % RESULT_STATES.length;
            setResultState(RESULT_STATES[nextIndex]);
          }}
          className={`px-4 py-2 font-bold border-2 border-black rounded hover:opacity-80 transition-opacity ${
            resultState === 'correct'
              ? 'bg-green-400 text-black'
              : resultState === 'missed'
                ? 'bg-orange-400 text-black'
                : 'bg-red-400 text-white'
          }`}
        >
          State: {resultState === 'correct' ? '✅ Correct' : resultState === 'missed' ? '⏰ Missed' : '❌ Incorrect'}
        </button>
        
        <button 
          onClick={() => setStolenPoints(stolenPoints === 0 ? 500 : (stolenPoints > 0 ? -300 : 0))}
          className="px-4 py-2 font-bold border-2 border-black rounded bg-zk-bg text-black hover:opacity-80 transition-opacity"
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
