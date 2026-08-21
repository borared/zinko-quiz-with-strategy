"use client";
import React, { useState } from 'react';
import ImposterPlayer from '@/components/Play/ImposterPlayer';

export default function TestImposterPlayerPage() {
  const initialData = {
    subPhase: 'VOTING_PHASE',
    round: 1,
    isImposter: false,
    secret: 'SNOWMAN',
    imposterTeam: 'B',
    correctTeams: ['A', 'C'],
    votes: {}
  };

  const [imposterData, setImposterData] = useState(initialData);

  const cyclePhase = () => {
    setImposterData(prev => {
      if (prev.subPhase === 'CLUE_PHASE') {
        if (prev.round < 3) {
          return { ...prev, round: prev.round + 1 };
        } else {
          return { ...prev, subPhase: 'VOTING_PHASE' };
        }
      } else if (prev.subPhase === 'VOTING_PHASE') {
        return { ...prev, subPhase: 'REVEAL_PHASE' };
      } else {
        return { ...initialData, isImposter: !prev.isImposter, secret: !prev.isImposter ? null : 'SNOWMAN' };
      }
    });
  };

  return (
    <div className="w-full h-screen font-sans relative group bg-zk-black">
      <ImposterPlayer 
        imposterData={imposterData} 
        team="A"
        isLeader={true}
        onSubmitClue={(c) => console.log('Submitted clue:', c)}
        onSabotageVote={(t) => console.log('Voted for team:', t)}
      />
      <button 
        onClick={cyclePhase}
        className="absolute bottom-8 right-8 bg-white text-black font-bold px-6 py-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50"
      >
        Next Phase (Current Role: {imposterData.isImposter ? 'Imposter' : 'Ally'})
      </button>
    </div>
  );
}
