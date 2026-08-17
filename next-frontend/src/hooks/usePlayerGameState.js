import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSocketStore } from '@/store/useSocketStore';
import { usePlayerSession } from './usePlayerSession';
import { usePlayerCoreGame } from './usePlayerCoreGame';
import { usePlayerSkills } from './usePlayerSkills';
import { usePlayerMinigames } from './usePlayerMinigames';

export function usePlayerGameState() {
  const { pin } = useParams();
  const { getSocket } = useSocketStore();
  const { playerId, nickname, playerSkill, team, isLeader } = usePlayerSession();

  // 1. Core Game State
  const coreGame = usePlayerCoreGame({ pin, playerId, team, playerSkill });

  // 2. Skill State
  const skills = usePlayerSkills({ 
    pin, 
    playerId, 
    team, 
    playerSkill, 
    nickname, 
    phase: coreGame.phase, 
    selectedId: coreGame.selectedId 
  });

  // 3. Minigame State
  const minigames = usePlayerMinigames({ 
    pin, 
    playerId, 
    setPhase: coreGame.setPhase, 
    setQuestion: coreGame.setQuestion 
  });

  // 4. Initial Sync
  useEffect(() => {
    const socket = getSocket();
    if (!socket || playerId === 'unknown') return;

    socket.emit('player:sync-state', { pin, playerId });
  }, [getSocket, pin, playerId]);

  return {
    playerId,
    nickname,
    playerSkill,
    team,
    pin,
    isLeader,
    
    // Core game properties
    ...coreGame,
    
    // Skill properties
    ...skills,

    // Minigame properties
    ...minigames
  };
}
