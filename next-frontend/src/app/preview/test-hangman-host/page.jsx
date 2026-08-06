"use client";
import React, { useState, useEffect } from 'react';
import HangmanHost from '@/components/HostGame/HangmanHost';

export default function TestHangmanHostPage() {
  const [hangmanData, setHangmanData] = useState({
    wordLength: 7,
    hint: "A programming language",
    category: "Technology",
    state: {
      A: { lives: 6, isEliminated: false },
      B: { lives: 6, isEliminated: false },
      C: { lives: 6, isEliminated: false },
      D: { lives: 6, isEliminated: false }
    },
    teams: ['A', 'B', 'C', 'D'],
    teamNames: { A: 'Alpha Squad', B: 'Beta Force' }
  });

  useEffect(() => {
    // Simulate someone making a wrong guess
    const t1 = setTimeout(() => {
      setHangmanData(prev => ({
        ...prev,
        state: { ...prev.state, A: { lives: 5, isEliminated: false } }
      }));
    }, 2000);

    // Simulate team B getting eliminated
    const t2 = setTimeout(() => {
      setHangmanData(prev => ({
        ...prev,
        state: { ...prev.state, B: { lives: 0, isEliminated: true } }
      }));
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div 
      className="w-full h-screen font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/city.jpg")' }}
    >
      <HangmanHost hangmanData={hangmanData} />
    </div>
  );
}
