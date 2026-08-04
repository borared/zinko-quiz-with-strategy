"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LeaderboardPhase from '@/components/HostGame/LeaderboardPhase';

export default function PlayerResult() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const data = sessionStorage.getItem('leaderboard_data');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setLeaderboard(parsed.leaderboard || []);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-zk-blue font-sans">
      <LeaderboardPhase 
        leaderboard={leaderboard} 
        isFinalLeaderboard={true} 
        handleEndGame={() => router.push('/')} 
      />
    </div>
  );
}
