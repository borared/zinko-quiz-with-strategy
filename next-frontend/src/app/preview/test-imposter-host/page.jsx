"use client";
import React, { useState } from 'react';
import ImposterHost from '@/components/HostGame/ImposterHost';

export default function TestImposterHostPage() {
  const initialData = {
    subPhase: 'CLUE_PHASE', // 'CLUE_PHASE', 'VOTING_PHASE', 'REVEAL_PHASE'
    round: 1,
    teams: ['A', 'B', 'C', 'D'],
    teamNames: { A: 'Alpha', B: 'Beta', C: 'Gamma', D: 'Delta' },
    clues: { 
      1: { A: 'COLD', B: 'ICE' },
      2: {},
      3: {}
    },
    votes: { A: true },
    correctTeams: ['A', 'C'],
    imposterTeam: 'B',
    secret: 'SNOWMAN'
  };

  const [imposterData, setImposterData] = useState(initialData);

  const cyclePhase = () => {
    setImposterData(prev => {
      if (prev.subPhase === 'CLUE_PHASE') {
        if (prev.round < 3) {
          // add some clues
          const nextClues = { ...prev.clues };
          nextClues[prev.round + 1] = { A: 'WINTER', C: 'FREEZE' };
          return { ...prev, round: prev.round + 1, clues: nextClues };
        } else {
          return { ...prev, subPhase: 'VOTING_PHASE' };
        }
      } else if (prev.subPhase === 'VOTING_PHASE') {
        return { ...prev, subPhase: 'REVEAL_PHASE' };
      } else {
        return initialData;
      }
    });
  };

  return (
    <div className="w-full h-screen font-sans relative group">
      <ImposterHost 
        imposterData={imposterData} 
        background="bg-zk-black"
      />
      <button 
        onClick={cyclePhase}
        className="absolute bottom-8 right-8 bg-white text-black font-bold px-6 py-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50"
      >
        Next Phase
      </button>
    </div>
  );
}
