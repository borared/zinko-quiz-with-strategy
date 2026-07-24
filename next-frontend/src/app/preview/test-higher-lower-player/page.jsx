"use client";
import React, { useState, useEffect } from 'react';
import HigherLowerPlayer from '@/components/Play/HigherLowerPlayer';

export default function TestHigherLowerPlayerPage() {
  const [subPhase, setSubPhase] = useState('INTRO');
  const [currentTurn, setCurrentTurn] = useState('A');
  const [statusObj, setStatusObj] = useState(null);

  useEffect(() => {
    // Sequence
    const timeouts = [];
    
    // INTRO -> COUNTDOWN -> PICK
    timeouts.push(setTimeout(() => setSubPhase('COUNTDOWN'), 3000));
    timeouts.push(setTimeout(() => setSubPhase('PICK'), 6000));

    // Simulation: Both Lock In -> GUESS
    timeouts.push(setTimeout(() => {
      setSubPhase('GUESS');
      setCurrentTurn('A');
    }, 10000));

    // Turn switches
    timeouts.push(setTimeout(() => {
      setStatusObj({ value: 'HIGHER', ts: Date.now() });
      setCurrentTurn('B');
    }, 12000));

    timeouts.push(setTimeout(() => {
      setCurrentTurn('A');
    }, 14000));

    timeouts.push(setTimeout(() => {
      setStatusObj({ value: 'LOWER', ts: Date.now() });
      setCurrentTurn('B');
    }, 16000));

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full h-screen font-sans flex flex-col">
      <HigherLowerPlayer
        onGuess={(g) => console.log('Guessed', g)}
        onSetSecret={(s) => console.log('Secret set', s)}
        statusObj={statusObj}
        subPhase={subPhase}
        currentTurn={currentTurn}
        team="A"
      />
    </div>
  );
}
