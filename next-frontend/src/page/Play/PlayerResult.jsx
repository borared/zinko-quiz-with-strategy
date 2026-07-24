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
    <LeaderboardPhase 
      leaderboard={leaderboard} 
      isFinalLeaderboard={true} 
      handleEndGame={() => router.push('/')} 
    />
  );
}
