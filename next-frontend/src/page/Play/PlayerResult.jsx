"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LeaderboardPhase from '@/components/HostGame/LeaderboardPhase';
import IndividualLeaderboardPhase from '@/components/HostGame/IndividualLeaderboardPhase';

export default function PlayerResult() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameType, setGameType] = useState('STANDARD');

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
    const type = sessionStorage.getItem('game_type');
    if (type) {
      setGameType(type);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-zk-blue font-sans">
      {gameType === 'PICTURE_RACE' ? (
        <IndividualLeaderboardPhase
          leaderboard={leaderboard}
          isFinalLeaderboard={true}
          isPlayerView={true}
          handleEndGame={() => router.push('/')}
        />
      ) : (
        <LeaderboardPhase 
          leaderboard={leaderboard} 
          isFinalLeaderboard={true} 
          handleEndGame={() => router.push('/')} 
        />
      )}
    </div>
  );
}
