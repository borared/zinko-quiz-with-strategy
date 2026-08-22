"use client";
import React from 'react';
import RewardWheel from '@/components/HostGame/RewardWheel';

export default function TestWheelPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <RewardWheel 
        pin="1234" 
        winnerTeam={1} 
        spinnerName="Test Player" 
        isSpinner={true} 
        onRewardClaimed={() => alert("Reward Claimed!")}
        playerId="test-1"
        background="/background_battle/city.jpg"
      />
    </div>
  );
}
