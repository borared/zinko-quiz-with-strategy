"use client";
import React from 'react';
import ResultPhase from '@/components/HostGame/ResultPhase';

export default function PreviewResultPhase() {
  // Mock data matching the screenshot
  const mockQuestion = {
    questionText: "Which musician is known as the 'King of Rock and Roll'?",
    options: ["Elvis Presley", "Chuck Berry", "Little Richard", "Jerry Lee Lewis"],
    correctAnswer: "A"
  };

  const mockStats = [
    { count: 0, text: "Elvis Presley", isCorrect: true },
    { count: 0, text: "Chuck Berry", isCorrect: false },
    { count: 0, text: "Little Richard", isCorrect: false },
    { count: 0, text: "Jerry Lee Lewis", isCorrect: false }
  ];

  const mockLeaderboard = [
    { id: 1, nickname: "gg", score: 8500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gg" },
    { id: 2, nickname: "kitty", score: 7200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kitty" },
    { id: 3, nickname: "alex", score: 6400, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex" }
  ];

  return (
    <div className="w-full min-h-screen">
      <ResultPhase 
        question={mockQuestion}
        stats={mockStats}
        leaderboard={mockLeaderboard}
        handleShowLeaderboard={() => alert("Leaderboard clicked")}
        handleNextQuestion={() => alert("Next Question clicked")}
      />
    </div>
  );
}
