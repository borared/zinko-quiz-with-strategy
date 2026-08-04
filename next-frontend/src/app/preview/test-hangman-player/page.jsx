"use client";
import React, { useState } from 'react';
import HangmanPlayer from '@/components/Play/HangmanPlayer';

export default function TestHangmanPlayerPage() {
  const [hangmanData, setHangmanData] = useState({
    word: "REACTJS",
    wordLength: 7,
    hint: "A popular frontend library",
    category: "Web Development",
    state: {
      A: { lives: 6, guessedLetters: [], isEliminated: false }
    }
  });

  const handleGuess = (letter) => {
    setHangmanData(prev => {
      const isCorrect = prev.word.includes(letter);
      const currentState = prev.state.A;
      
      const newLives = isCorrect ? currentState.lives : currentState.lives - 1;
      const newEliminated = newLives <= 0;

      return {
        ...prev,
        state: {
          ...prev.state,
          A: {
            ...currentState,
            guessedLetters: [...currentState.guessedLetters, letter],
            lives: newLives,
            isEliminated: newEliminated
          }
        }
      };
    });
  };

  return (
    <div className="w-full h-screen font-sans bg-zk-black">
      <HangmanPlayer 
        hangmanData={hangmanData} 
        team="A" 
        onGuess={handleGuess} 
        background="bg-zk-black" 
      />
    </div>
  );
}
