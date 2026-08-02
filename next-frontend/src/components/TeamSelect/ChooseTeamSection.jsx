"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTransitionStore } from '@/store/useTransitionStore';
import { useSocketStore } from '@/store/useSocketStore';
import { useRouter, useParams } from 'next/navigation';
import { useToastStore } from '@/store/useToastStore';
import TeamHeader from './TeamHeader';
import TeamCard from './TeamCard';
import WaitingBar from './WaitingBar';

// Reusable spring bounce variant
const bounceIn = (delay = 0) => ({
  initial: { scale: 0, opacity: 0, y: 60 },
  animate: { scale: 1, opacity: 1, y: 0 },
  transition: {
    delay,
    type: 'spring',
    stiffness: 400,
    damping: 18,
    mass: 0.8,
  },
});

// Generate anonymous player ID if not already set
function getOrCreatePlayerId() {
  let id = sessionStorage.getItem('player_id');
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
    sessionStorage.setItem('player_id', id);
  }
  return id;
}

const TEAM_THEMES = {
  A: { badge: 'POWER', icon: '⚡', bgColor: '#4ADE80' },
  B: { badge: 'SPEED', icon: '🚀', bgColor: '#F87171' },
  C: { badge: 'MIND', icon: '🧠', bgColor: '#60A5FA' },
  D: { badge: 'LIGHT', icon: '🌟', bgColor: '#FBBF24' },
  E: { badge: 'SHADOW', icon: '🌑', bgColor: '#A78BFA' },
  F: { badge: 'FLAME', icon: '🔥', bgColor: '#FB923C' },
  G: { badge: 'HEART', icon: '💖', bgColor: '#F472B6' },
  H: { badge: 'NATURE', icon: '🌿', bgColor: '#34D399' },
  I: { badge: 'MYSTIC', icon: '🔮', bgColor: '#818CF8' },
};

function getTeamCounts(players = []) {
  return players.reduce((counts, player) => {
    if (player.team) {
      counts[player.team] = (counts[player.team] || 0) + 1;
    }
    return counts;
  }, {});
}

const ChooseTeamSection = () => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [joining, setJoining] = useState(false);
  const [teamCounts, setTeamCounts] = useState({});
  const [teams, setTeams] = useState(['A', 'B']);
  const [teamNames, setTeamNames] = useState({});
  const joinedRef = useRef(false);
  const { blinkTo } = useTransitionStore();
  const { getSocket, isConnected } = useSocketStore();
  const router = useRouter();
  const { pin } = useParams();
  const { showToast } = useToastStore();

  useEffect(() => {
    if (!pin) {
      router.replace('/join');
    }
  }, [pin, router]);

  // Explicitly leave team when returning to this screen
  useEffect(() => {
    const socket = getSocket();
    const playerId = sessionStorage.getItem('player_id');
    if (socket && pin && playerId) {
      socket.emit('player:leave-team', { pin, playerId });
      sessionStorage.removeItem('player_team');
    }
  }, [getSocket, pin]);

  const syncTeamCounts = useCallback((players = []) => {
    setTeamCounts(getTeamCounts(players));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected || !pin) return;

    const requestPlayers = () => {
      socket.emit('lobby:request-players', { pin });
    };

    const onPlayersUpdate = (data) => {
      syncTeamCounts(data?.players || []);
      if (data?.teams) setTeams(data.teams);
      if (data?.teamNames) setTeamNames(data.teamNames);
    };

    requestPlayers();
    socket.on('lobby:players-update', onPlayersUpdate);

    return () => {
      socket.off('lobby:players-update', onPlayersUpdate);
    };
  }, [getSocket, isConnected, pin, syncTeamCounts]);

  if (!pin) {
    return null;
  }

  const handleJoin = (team) => {
    if (joining) return;
    setJoining(true);

    setSelectedTeam(team);

    // Pull stored session data
    // Use the pin from the URL directly
    const nickname = sessionStorage.getItem('player_nickname') || 'Player';
    const avatar   = sessionStorage.getItem('player_avatar') || 'avatar1.png';
    const playerId = getOrCreatePlayerId();

    // Store team for PlayerLobby / PlayerController to read
    sessionStorage.setItem('player_team', team);

    if (pin) {
      const socket = getSocket();
      joinedRef.current = true;

      // Emit join event so the backend adds us to the room
      socket.emit('player:join', { pin, playerId, nickname, avatar, team });

      // Listen for confirmation once (or proceed optimistically)
        let joinSucceeded = false;
        const onJoined = () => {
          joinSucceeded = true;
          socket.off('player:joined', onJoined);
          socket.off('error', onError);
          setJoining(false);
          blinkTo(`/play/${pin}/lobby`);
        };

      const onError = ({ message }) => {
        // Show error toast using Zinko style (red)
        showToast(message, 'error');
        socket.off('player:joined', onJoined);
        socket.off('error', onError);
        joinedRef.current = false;
        setJoining(false);
      };

        socket.once('player:joined', onJoined);
        socket.once('error', onError);



    } else {
      // No PIN in session — fallback to old warmup flow
      blinkTo(`/play/${pin}/team-warmup`);
    }
  };

  return (
    <div className="relative w-full h-screen max-h-screen overflow-hidden bg-zk-yellow flex flex-col items-center justify-center font-sans px-6 pb-14">

      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ y: [-12, 12, -12], x: [-6, 6, -6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#D4A322]/50 border-[3px] border-zk-black/10 pointer-events-none"
      />
      <motion.div
        animate={{ y: [10, -10, 10], rotate: [45, 60, 45] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-24 right-12 w-16 h-16 md:w-24 md:h-24 rotate-45 bg-[#FFB020]/70 border-[3px] border-zk-black/10 pointer-events-none rounded-xl"
      />
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-6 w-8 h-8 rounded-full bg-[#5D3FD3]/20 border-[2px] border-zk-black/10 pointer-events-none"
      />
      <motion.div
        animate={{ y: [15, -15, 15], x: [10, -10, 10], rotate: [0, 90, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-20 w-10 h-10 md:w-14 md:h-14 bg-[#4ADE80]/30 border-[3px] border-zk-black/10 pointer-events-none"
      />
      <motion.div
        animate={{ y: [-20, 20, -20], x: [15, -15, 15] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-32 left-16 w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#F87171]/40 border-[3px] border-zk-black/10 pointer-events-none"
      />
      <motion.div
        animate={{ y: [5, -5, 5], rotate: [0, -45, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 right-8 w-6 h-6 md:w-10 md:h-10 bg-zk-white/50 border-[2px] border-zk-black/10 pointer-events-none rounded-sm"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-full px-4 md:px-8">

        {/* Header bounces in first */}
        <motion.div {...bounceIn(0)} className="w-full flex justify-center">
          <TeamHeader />
        </motion.div>

        {/* Cards Row — each card bounces in with a slight delay */}
        <div className="flex flex-row flex-wrap items-start justify-center gap-4 md:gap-6 w-full mt-4">
          {teams.map((teamId, index) => {
            const theme = TEAM_THEMES[teamId] || TEAM_THEMES.A;
            return (
              <motion.div key={teamId} {...bounceIn(0.1 + index * 0.1)} className="w-[140px] md:w-[200px] flex justify-center">
                <TeamCard
                  team={teamId}
                  teamName={teamNames[teamId] || `Team ${teamId}`}
                  badge={theme.badge}
                  icon={theme.icon}
                  bgColor={theme.bgColor}
                  onJoin={() => handleJoin(teamId)}
                />
              </motion.div>
            );
          })}
        </div>



        {/* Joining overlay */}
        {joining && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-zk-yellow/80 flex items-center justify-center rounded-xl"
          >
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-zk-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="font-black uppercase tracking-widest text-zk-black text-sm">Joining game...</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Waiting bar slides up from the bottom */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute bottom-0 left-0 w-full"
      >
        <WaitingBar />
      </motion.div>

    </div>
  );
};

export default ChooseTeamSection;
