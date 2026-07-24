"use client";
import React, { useState, useEffect } from 'react';
import HigherLowerHost from '@/components/HostGame/HigherLowerHost';

export default function TestHigherLowerHostPage() {
  const [subPhase, setSubPhase] = useState('INTRO');
  const [currentTurn, setCurrentTurn] = useState('A');
  const [teamA, setTeamA] = useState({ guess: null, status: null, lockedIn: false });
  const [teamB, setTeamB] = useState({ guess: null, status: null, lockedIn: false });

  useEffect(() => {
    // Sequence
    const timeouts = [];
    
    // INTRO -> COUNTDOWN -> PICK
    timeouts.push(setTimeout(() => setSubPhase('COUNTDOWN'), 3000));
    timeouts.push(setTimeout(() => setSubPhase('PICK'), 6000));

    // Simulation: Team A Locks In
    timeouts.push(setTimeout(() => setTeamA(prev => ({ ...prev, lockedIn: true })), 8000));
    
    // Simulation: Team B Locks In -> GUESS
    timeouts.push(setTimeout(() => {
      setTeamB(prev => ({ ...prev, lockedIn: true }));
      setSubPhase('GUESS');
      setCurrentTurn('A');
    }, 10000));

    // Simulation: Guess sequence
    timeouts.push(setTimeout(() => {
      setTeamA({ guess: 50, status: 'HIGHER', lockedIn: true });
      setCurrentTurn('B');
    }, 12000));

    timeouts.push(setTimeout(() => {
      setTeamB({ guess: 75, status: 'LOWER', lockedIn: true });
      setCurrentTurn('A');
    }, 14000));

    timeouts.push(setTimeout(() => {
      setTeamA({ guess: 62, status: 'LOWER', lockedIn: true });
      setCurrentTurn('B');
    }, 16000));

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full h-screen font-sans">
      <HigherLowerHost
        teamA={teamA}
        teamB={teamB}
        winner={null}
        subPhase={subPhase}
        currentTurn={currentTurn}
      />
    </div>
  );
}
