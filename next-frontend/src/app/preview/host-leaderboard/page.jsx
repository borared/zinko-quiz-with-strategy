"use client";
import React from 'react';
import LeaderboardPhase from '@/components/HostGame/LeaderboardPhase';

export default function PreviewHostLeaderboard() {
  const mockLeaderboard = [
    { id: 1, nickname: "Alex", score: 8500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", team: "A" },
    { id: 2, nickname: "Sam", score: 4200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam", team: "A" },
    { id: 3, nickname: "Jordan", score: 9400, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan", team: "B" },
    { id: 4, nickname: "Taylor", score: 5100, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor", team: "B" },
    { id: 5, nickname: "Casey", score: 7800, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey", team: "C" },
    { id: 6, nickname: "Morgan", score: 6200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan", team: "D" },
  ];

  return (
    <div className="w-full min-h-screen">
      <LeaderboardPhase 
        leaderboard={mockLeaderboard}
        isFinalLeaderboard={false}
        handleNextQuestion={() => alert("Next Question clicked")}
        handleEndGame={() => alert("End Game clicked")}
      />
    </div>
  );
}
