import { useState, useEffect } from 'react';

const PLAYER_SESSION_DEFAULTS = {
  playerId: 'unknown',
  nickname: 'Player',
  playerSkill: null,
  team: 'A',
  avatar: 'pizza',
  isLeader: false,
  isLoaded: false,
};

export function usePlayerSession() {
  const [session, setSession] = useState(PLAYER_SESSION_DEFAULTS);

  useEffect(() => {
    setSession({
      playerId: sessionStorage.getItem('player_id') || PLAYER_SESSION_DEFAULTS.playerId,
      nickname: sessionStorage.getItem('player_nickname') || PLAYER_SESSION_DEFAULTS.nickname,
      playerSkill: sessionStorage.getItem('player_skill') || PLAYER_SESSION_DEFAULTS.playerSkill,
      team: sessionStorage.getItem('player_team') || PLAYER_SESSION_DEFAULTS.team,
      avatar: sessionStorage.getItem('player_avatar') || PLAYER_SESSION_DEFAULTS.avatar,
      isLeader: sessionStorage.getItem('player_is_leader') === 'true',
      isLoaded: true,
    });
  }, []);

  return session;
}