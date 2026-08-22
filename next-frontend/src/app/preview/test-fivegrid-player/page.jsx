"use client";
import React, { useState, useEffect } from 'react';
import FiveGridPlayer from '@/components/Play/FiveGridPlayer';

export default function TestFiveGridPlayerPage() {
  const [fivegridData, setFivegridData] = useState({
    wordLength: 5,
    hint: "A popular frontend library",
    category: "Web Development",
    state: {
      A: { lives: 6, guesses: [], isEliminated: false }
    }
  });

  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes
  const [winner, setWinner] = useState(null);

  const guesses = fivegridData.state.A.guesses;
  const isSolved = guesses.some(g => g.result.every(res => res === 'correct'));
  const isEliminated = fivegridData.state.A.isEliminated;

  useEffect(() => {
    if (isSolved || isEliminated || timeLeft <= 0) {
      if (timeLeft <= 0 && !isEliminated && !isSolved) {
        setFivegridData(prev => ({
          ...prev,
          state: {
            ...prev.state,
            A: {
              ...prev.state.A,
              isEliminated: true
            }
          }
        }));
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSolved, isEliminated]);

  const handleGuess = (guess) => {
    setFivegridData(prev => {
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

      if (solved) {
        setWinner({ teamName: "Team A", team: "A", word: secret });
      }

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
      <FiveGridPlayer 
        fivegridData={fivegridData} 
        team="A" 
        onGuess={handleGuess} 
        background="bg-zk-black"
        isLeader={true}
        timeLeft={timeLeft}
        overrideWinnerData={winner}
      />
    </div>
  );
}
