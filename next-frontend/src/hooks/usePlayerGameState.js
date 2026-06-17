import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSocketStore } from '@/store/useSocketStore';
import { usePlayerCoreGame } from './usePlayerCoreGame';
import { usePlayerSkills } from './usePlayerSkills';
import { usePlayerMinigames } from './usePlayerMinigames';

export function usePlayerGameState() {
  const { pin } = useParams();
  const { getSocket } = useSocketStore();

  const playerIdRef  = useRef(typeof window !== 'undefined' ? sessionStorage.getItem('player_id') || 'unknown' : 'unknown');
  const playerId = playerIdRef.current;
  const nickname  = typeof window !== 'undefined' ? sessionStorage.getItem('player_nickname') || 'Player' : 'Player';
  const playerSkill = typeof window !== 'undefined' ? sessionStorage.getItem('player_skill') || null : null;
  const team        = typeof window !== 'undefined' ? sessionStorage.getItem('player_team') || 'A' : 'A';

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
    if (socket) {
      // Initial fetch to get the current game state in case of late join or browser refresh
      // This will trigger 'player:sync-state-response' handled independently by the sub-hooks
      socket.emit('player:sync-state', { pin, playerId });
    }
  }, [getSocket, pin, playerId]);

  return {
    playerId,
    nickname,
    playerSkill,
    team,
    pin,
    
    // Core game properties
    ...coreGame,
    
    // Skill properties
    ...skills,

    // Minigame properties
    ...minigames
  };
}
