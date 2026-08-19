"use client";
import React, { useState, useEffect } from 'react';
import FiveGridHost from '@/components/HostGame/FiveGridHost';

export default function TestFiveGridHostPage() {
  const [fivegridData, setFivegridData] = useState({
    wordLength: 5,
    hint: "A programming language",
    category: "Technology",
    state: {
      A: { lives: 5, guesses: [], isEliminated: false },
      B: { lives: 5, guesses: [], isEliminated: false },
      C: { lives: 5, guesses: [], isEliminated: false },
      D: { lives: 5, guesses: [], isEliminated: false },
      E: { lives: 5, guesses: [], isEliminated: false },
      F: { lives: 5, guesses: [], isEliminated: false }
    },
    teams: ['A', 'B', 'C', 'D', 'E', 'F'],
    teamNames: { 
      A: 'Alpha Squad', B: 'Beta Force',
      C: 'Gamma Ray', D: 'Delta Core',
      E: 'Echo Base', F: 'Foxtrot Unit'
    }
  });

  useEffect(() => {
    // Simulate someone making a guess
    const t1 = setTimeout(() => {
      setFivegridData(prev => ({
        ...prev,
        state: { 
          ...prev.state, 
          A: { 
            lives: 4, 
            guesses: [{ word: "REACT", result: ['correct', 'present', 'absent', 'absent', 'absent'] }], 
            isEliminated: false 
          },
          C: { 
            lives: 0, 
            guesses: [
              { word: "WRONG", result: ['absent', 'absent', 'absent', 'absent', 'absent'] },
              { word: "WRONG", result: ['absent', 'absent', 'absent', 'absent', 'absent'] },
              { word: "WRONG", result: ['absent', 'absent', 'absent', 'absent', 'absent'] },
              { word: "WRONG", result: ['absent', 'absent', 'absent', 'absent', 'absent'] },
              { word: "WRONG", result: ['absent', 'absent', 'absent', 'absent', 'absent'] }
            ], 
            isEliminated: true 
          }
        }
      }));
    }, 2000);

    // Simulate team B guessing correctly
    const t2 = setTimeout(() => {
      setFivegridData(prev => ({
        ...prev,
        state: { 
          ...prev.state, 
          B: { 
            lives: 4, 
            guesses: [{ word: "CLONE", result: ['correct', 'correct', 'correct', 'correct', 'correct'] }], 
            isEliminated: false 
          } 
        }
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
      <FiveGridHost fivegridData={fivegridData} />
    </div>
  );
}
