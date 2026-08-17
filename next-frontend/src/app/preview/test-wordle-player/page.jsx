"use client";
import React, { useState } from 'react';
import WordlePlayer from '@/components/Play/WordlePlayer';

export default function TestWordlePlayerPage() {
  const [wordleData, setWordleData] = useState({
    wordLength: 5,
    hint: "A popular frontend library",
    category: "Web Development",
    state: {
      A: { lives: 6, guesses: [], isEliminated: false }
    }
  });

  const handleGuess = (guess) => {
    setWordleData(prev => {
      const secret = "REACT";
      const upperGuess = guess.toUpperCase();
      const result = Array(secret.length).fill('absent');
      const secretLetterCount = {};

      for (let i = 0; i < secret.length; i++) {
        if (upperGuess[i] === secret[i]) {
          result[i] = 'correct';
        } else {
          secretLetterCount[secret[i]] = (secretLetterCount[secret[i]] || 0) + 1;
        }
      }

      for (let i = 0; i < secret.length; i++) {
        if (result[i] === 'correct') continue;
        const char = upperGuess[i];
        if (secretLetterCount[char] > 0) {
          result[i] = 'present';
          secretLetterCount[char]--;
        }
      }

      const currentState = prev.state.A;
      const newGuesses = [...currentState.guesses, { word: upperGuess, result }];
      const newLives = currentState.lives - 1;
      const solved = upperGuess === secret;
      const eliminated = newLives <= 0 && !solved;

      return {
        ...prev,
        state: {
          ...prev.state,
          A: {
            ...currentState,
            guesses: newGuesses,
            lives: newLives,
            isEliminated: eliminated
          }
        }
      };
    });
  };

  return (
    <div className="w-full h-screen font-sans bg-zk-black">
      <WordlePlayer 
        wordleData={wordleData} 
        team="A" 
        onGuess={handleGuess} 
        background="bg-zk-black"
        isLeader={true}
      />
    </div>
  );
}
