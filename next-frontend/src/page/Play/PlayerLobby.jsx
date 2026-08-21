"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
;
import { useSocketStore } from '@/store/useSocketStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, ArrowLeft, Pencil } from 'lucide-react';

import PlayerLobbyChat from '@/components/Play/PlayerLobbyChat';
import AvatarEmojiBurst from '@/components/Play/AvatarEmojiBurst';
import { isEmojiHeavy } from '@/lib/lobbyChatUtils';
import { playEmojiReactionSound } from '@/lib/lobbySounds';
import { DEFAULT_LOBBY_SCENERY, setStoredGameBackground } from '@/lib/lobbyScenery';

const AVATAR_REACTION_MS = 2600;

/* ── Shared animation helper ─────────────────────────────────────────────── */
const bounceIn = (delay = 0) => ({
  initial: { scale: 0, opacity: 0, y: 50 },
  animate: { scale: 1, opacity: 1, y: 0 },
  transition: { delay, type: 'spring', stiffness: 380, damping: 18, mass: 0.9 },
});



/* ─── BlinkingEye ────────────────────────────────────────────────────────── */
function BlinkingEye({ size = 60, x, y, delay = 0, pupilColor = '#1a1a1a' }) {
  return (
    <motion.div
      animate={{ y: [-8, 8, -8] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      className="absolute pointer-events-none z-0"
      style={{ width: size, height: size * 0.55, left: x, top: y }}
    >
      <motion.div
        className="w-full h-full rounded-full bg-zk-panel-bg border-[3px] border-[#000000] flex items-center justify-center overflow-hidden"
        style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.4)' }}
        animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay + 1.5,
          times: [0, 0.4, 0.5, 0.6, 1],
        }}
      >
        <div
          className="rounded-full border-[2px] border-[#000000]"
          style={{
            width: size * 0.38,
            height: size * 0.38,
            backgroundColor: pupilColor,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── PlayerSlot ─────────────────────────────────────────────────────────── */
const TEAM_THEMES = {
  A: { bg: '#2ea84a', shadow: '#1a6b2e', dark: '#1a7a2e', icon: Users },
  B: { bg: '#c0392b', shadow: '#7b1515', dark: '#8b1a1a', icon: Zap },
  C: { bg: '#3498db', shadow: '#21618c', dark: '#2874a6', icon: Users },
  D: { bg: '#f1c40f', shadow: '#b7950b', dark: '#d4ac0d', icon: Zap },
  E: { bg: '#9b59b6', shadow: '#633974', dark: '#76448a', icon: Users },
  F: { bg: '#e67e22', shadow: '#a04000', dark: '#ba4a00', icon: Zap },
  G: { bg: '#e84393', shadow: '#b33939', dark: '#b71540', icon: Users },
  H: { bg: '#00b894', shadow: '#006266', dark: '#009432', icon: Zap },
  I: { bg: '#341f97', shadow: '#1e272e', dark: '#5f27cd', icon: Users },
};

function PlayerSlot({ player, isFirst, teamId, isMe, floatingEmojis = [], onClick }) {
  const theme = TEAM_THEMES[teamId] || TEAM_THEMES.A;
  const darkColor = theme.dark;
  const Icon = theme.icon;
  const myHighlight = isMe ? 'border-[#FFCD29] border-[4px]' : 'border-white border-[2px]';

  if (!player) {
    return (
      <div
        className="w-full aspect-square border-[2px] border-dashed flex flex-col items-center justify-center"
        style={{ borderColor: darkColor, backgroundColor: darkColor }}
      >
        {isFirst && (
          <Icon size={28} color="white" opacity={0.9} />
        )}
        {!isFirst && (
          <span className="text-white text-[10px] font-black uppercase tracking-widest opacity-50">
            Empty
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full aspect-square overflow-visible ${onClick ? 'cursor-pointer hover:brightness-[1.03] active:scale-95 transition-all' : ''}`}
      onClick={onClick}
    >
      <div
        className={`w-full h-full ${myHighlight} flex flex-col items-center justify-center relative overflow-hidden rounded`}
        style={{ backgroundColor: darkColor }}
      >
        {isMe && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-[#FFCD29]/30 pointer-events-none"
          />
        )}
        <div className="absolute inset-0 bg-zk-panel-bg/10" />

        <img
          src={player.avatar || ''}
          alt="avatar"
          className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
        />

        <div className="absolute bottom-0 right-0 bg-zk-panel-bg px-2 py-1 rounded-tl-lg z-20 border-t-[2px] border-l-[2px] border-[#000000]">
          <span className="text-[#000000] font-black text-[10px] md:text-xs tracking-wider relative block">
            {player.nickname}
          </span>
        </div>
        {isMe && (
          <span className="absolute top-1 right-1 text-[8px] bg-[#FFCD29] text-black px-1.5 py-0.5 rounded font-black z-20 border-[2px] border-[#000000]">
            YOU
          </span>
        )}
      </div>

      {player.isLeader && (
        <span className="absolute -top-2 -left-2 text-[10px] bg-[#FFCD29] text-black px-2 py-[2px] rounded font-black z-30 border-[2px] border-[#000000] pointer-events-none transform -rotate-12">
          LEADER
        </span>
      )}

      {floatingEmojis.map((reaction, index) => (
        <AvatarEmojiBurst
          key={reaction.reactionId}
          emoji={reaction.emoji}
          reactionId={reaction.reactionId}
          index={index}
        />
      ))}
    </div>
  );
}

/* ─── TeamPanel ──────────────────────────────────────────────────────────── */
function TeamPanel({ teamName, teamId, players, myNickname, avatarReactions, onPromote }) {
  const theme = TEAM_THEMES[teamId] || TEAM_THEMES.A;
  const bgColor = theme.bg;
  const shadowColor = theme.shadow;

  // Sort leader to be first in the grid
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isLeader && !b.isLeader) return -1;
    if (!a.isLeader && b.isLeader) return 1;
    return 0;
  });
  const slots = [...sortedPlayers, ...Array(Math.max(0, 4 - sortedPlayers.length)).fill(null)];

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(teamName);
  const { getSocket, isConnected } = useSocketStore();
  const { pin } = useParams();
  const playerId = typeof window !== 'undefined' ? sessionStorage.getItem('player_id') : null;

  const handleSave = () => {
    const socket = getSocket();
    if (socket && isConnected && pin && playerId) {
      socket.emit('lobby:rename-team', {
        pin,
        playerId,
        teamId,
        newName: editName
      });
    }
    setIsEditing(false);
  };

  const myPlayer = players.find(p => p.nickname === myNickname);
  const isMyTeam = myPlayer && myPlayer.team === teamId;
  const isMeLeader = myPlayer && myPlayer.isLeader;

  return (
    <div
      className="w-full border-[4px] border-[#000000] p-4 flex flex-col gap-3 rounded-xl"
      style={{ backgroundColor: bgColor, boxShadow: `6px 6px 0px 0px ${shadowColor}` }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={15}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              onBlur={handleSave}
              autoFocus
              className="font-black text-xl text-black px-2 py-1 rounded w-32 border-[2px] border-black outline-none"
            />
          </div>
        ) : (
          <span 
            className="font-black text-xl text-white tracking-wider flex items-center gap-2 cursor-pointer"
            onClick={() => myNickname && players.some(p => p.nickname === myNickname) && setIsEditing(true)}
          >
            {teamName}
            {myNickname && players.some(p => p.nickname === myNickname) && (
              <div className="bg-zk-panel-bg text-black p-1.5 rounded-full ml-1 hover:bg-gray-100 transition-colors border-[2px] border-black cursor-pointer">
                <Pencil size={14} strokeWidth={3} />
              </div>
            )}
          </span>
        )}
        <div className="bg-zk-panel-bg border-[2px] border-[#000000] px-2 py-[2px] rounded-xl flex items-center justify-center">
          <span className="font-black text-[10px] text-[#000000] tracking-wider leading-none mt-[2px]">
            Player Count: {players.length}
          </span>
        </div>
      </div>

      {/* 2×2 player grid */}
      <div className="grid grid-cols-2 gap-2 overflow-visible py-2">
        {slots.map((player, i) => {
          const isClickable = isMyTeam && isMeLeader && player && player.id !== myPlayer.id;
          return (
            <PlayerSlot
              key={player?.id || `empty-${i}`}
              player={player}
              isFirst={i === 0 && !player}
              teamId={teamId}
              isMe={player && player.nickname === myNickname}
              floatingEmojis={player ? avatarReactions[player.id] || [] : []}
              onClick={isClickable ? () => onPromote(player) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── VsCard (animated) ──────────────────────────────────────────────────── */
function VsCard() {
  return (
    <motion.div
      animate={{ rotate: [-6, 6, -6], scale: [1, 1.08, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className="flex-shrink-0 w-16 h-20 bg-[#1a1a6e] border-[4px] border-[#5D3FD3] flex items-center justify-center mx-2 z-10"
      style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
    >
      <span className="font-black text-white text-2xl uppercase tracking-tighter">VS</span>
    </motion.div>
  );
}

import { useOwnedSceneryStore } from '@/store/useOwnedSceneryStore';

export default function PlayerLobby() {
  const { pin } = useParams();
  const router = useRouter();
  const { getSocket, isConnected } = useSocketStore();


  const nickname = typeof window !== 'undefined' ? sessionStorage.getItem('player_nickname') || 'Player' : 'Player';
  const team     = typeof window !== 'undefined' ? sessionStorage.getItem('player_team') || 'A' : 'A';
  const playerId = typeof window !== 'undefined' ? sessionStorage.getItem('player_id') : null;

  const [bgImage, setBgImage] = useState(DEFAULT_LOBBY_SCENERY);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState(['A', 'B']);
  const [teamNames, setTeamNames] = useState({});
  const [startCountdown, setStartCountdown] = useState(null);
  const [promoteTarget, setPromoteTarget] = useState(null);
  const [avatarReactions, setAvatarReactions] = useState({});
  const reactionTimers = useRef(new Map());

  const [isSceneryPickerOpen, setIsSceneryPickerOpen] = useState(false);
  const [sceneryProviderNickname, setSceneryProviderNickname] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const ownedScenery = useOwnedSceneryStore((s) => s.ownedScenery);
  const fetchOwnedScenery = useOwnedSceneryStore((s) => s.fetchOwnedScenery);

  useEffect(() => {
    fetchOwnedScenery();
  }, [fetchOwnedScenery]);

  useEffect(() => {
    if (pin && bgImage) setStoredGameBackground(pin, bgImage);
  }, [pin, bgImage]);

  const triggerAvatarReaction = useCallback((targetPlayerId, emoji) => {
    if (!targetPlayerId || !emoji) return;

    playEmojiReactionSound(emoji);

    const reactionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setAvatarReactions((prev) => ({
      ...prev,
      [targetPlayerId]: [...(prev[targetPlayerId] || []).slice(-2), { emoji, reactionId }],
    }));

    if (reactionTimers.current.has(reactionId)) {
      clearTimeout(reactionTimers.current.get(reactionId));
    }

    const timer = setTimeout(() => {
      setAvatarReactions((prev) => ({
        ...prev,
        [targetPlayerId]: (prev[targetPlayerId] || []).filter((r) => r.reactionId !== reactionId),
      }));
      reactionTimers.current.delete(reactionId);
    }, AVATAR_REACTION_MS);

    reactionTimers.current.set(reactionId, timer);
  }, []);

  const handleLobbyChatMessage = useCallback((msg) => {
    if (isEmojiHeavy(msg.message)) {
      triggerAvatarReaction(msg.playerId, msg.message.trim());
    }
  }, [triggerAvatarReaction]);

  useEffect(() => () => {
    reactionTimers.current.forEach((timer) => clearTimeout(timer));
    reactionTimers.current.clear();
  }, []);

  // Socket logic
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected) return;

      // Request current player list for this lobby
      if (pin) {
        socket.emit('lobby:request-players', { pin });
      }

    const onPlayersUpdate = (data) => {
      setPlayers(data.players || []);
      if (data.teams) setTeams(data.teams);
      if (data.teamNames) setTeamNames(data.teamNames);
      if (data.background) setBgImage(data.background);
      if (data.sceneryProviderNickname !== undefined) {
        setSceneryProviderNickname(data.sceneryProviderNickname);
      }

      const myInfo = (data.players || []).find(p => p.id === playerId);
      if (myInfo) {
        sessionStorage.setItem('player_is_leader', myInfo.isLeader ? 'true' : 'false');
      }
    };

    const onBackgroundUpdate = (data) => {
      if (data.background) setBgImage(data.background);
      setSceneryProviderNickname(data.sceneryProviderNickname || null);
    };

    const onQuestion = (data) => {
      router.push(`/play/${pin}/game`, { state: { question: data } });
    };

    const onCountdownStarted = () => {
      setStartCountdown(3);
      const interval = setInterval(() => {
        setStartCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimeout(() => {
              router.push(`/play/${pin}/choose-skill`);
            }, 0);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    };

    socket.on('lobby:players-update', onPlayersUpdate);
    socket.on('lobby:background-update', onBackgroundUpdate);
    socket.on('game:question', onQuestion);
    socket.on('lobby:countdown-started', onCountdownStarted);

    return () => {
      socket.off('lobby:players-update', onPlayersUpdate);
      socket.off('lobby:background-update', onBackgroundUpdate);
      socket.off('game:question', onQuestion);
      socket.off('lobby:countdown-started', onCountdownStarted);
    };
  }, [getSocket, isConnected, pin, router, nickname, team, playerId]);


  const handleGoBack = () => {
    if (startCountdown !== null) return;

    const socket = getSocket();
    if (socket && pin && playerId) {
      socket.emit('player:leave-team', { pin, playerId });
    }
    sessionStorage.removeItem('player_team');
    router.push(`/play/${pin}/choose-team`);
  };

  return (
    <div
      className="relative w-full h-screen max-h-screen overflow-x-hidden flex flex-col font-sans pt-6 pb-24 px-6"
      style={{
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#FFCD29',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Blinking Eye Decorations */}
      <BlinkingEye size={72} x="5%" y="10%" delay={0} pupilColor="#1a1a1a" />
      <BlinkingEye size={50} x="85%" y="15%" delay={1.2} pupilColor="#5D3FD3" />
      <BlinkingEye size={40} x="88%" y="70%" delay={0.6} pupilColor="#c0392b" />
      <BlinkingEye size={45} x="3%" y="75%" delay={2} pupilColor="#2ea84a" />

      {/* Start Game Countdown Overlay */}
      {startCountdown !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <motion.div
            key={startCountdown}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1.5, 1], opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="text-[15rem] md:text-[20rem] font-black text-[#FFCD29] drop-shadow-[0_10px_0_rgba(0,0,0,1)] zinko-font"
            style={{ WebkitTextStroke: '8px #000000' }}
          >
            {startCountdown}
          </motion.div>
        </div>
      )}

      {/* Fixed Go Back Button */}
      <motion.button
        {...bounceIn(0.18)}
        type="button"
        onClick={handleGoBack}
        disabled={startCountdown !== null}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95, y: 4 }}
        className="fixed bottom-2 left-1/2 -translate-x-1/2 md:bottom-4 z-50 flex items-center justify-center gap-2 bg-zk-blue hover:bg-[#5D3FD3] text-white border-[3px] border-zk-border px-6 py-2 md:px-8 md:py-3 rounded-xl uppercase font-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '1.5rem', letterSpacing: '1px' }}
      >
        <ArrowLeft size={24} strokeWidth={3} />
        <span>Go Back</span>
      </motion.button>

      {/* ── Content Container ──────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-6xl mx-auto pt-4">
        
        {/* Top Bar: Header Only */}
        <motion.div {...bounceIn(0)} className="w-full flex justify-center mb-6 lg:mb-10">
          <div className="flex flex-col items-center justify-start">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight permanent-marker-regular whitespace-nowrap"
              style={{ WebkitTextStroke: '3px #1a1a1a' }}
            >
              You're In!
            </h1>
            <div
              className="inline-flex mt-2 text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] px-4 py-1.5 items-center gap-2"
              style={{ backgroundColor: '#5D3FD3' }}
            >
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[#FFCD29]"
              />
              Waiting for Host to start...
            </div>
          </div>
        </motion.div>

        {/* Team Panels + Go Back */}
        <div className="flex-1 flex flex-col items-center justify-start w-full max-w-6xl mx-auto min-h-0 overflow-y-auto scrollbar-hide pt-4 pb-8">
          <div className="flex flex-row flex-wrap items-center justify-center gap-4 w-full">
            {teams.map((teamId, index) => {
              const teamPlayers = players.filter((p) => p.team === teamId);
              return (
                <div key={teamId} className="flex items-center justify-center gap-4">
                  {teams.length === 2 && index === 1 && (
                    <motion.div {...bounceIn(0.2)} className="hidden md:flex">
                      <VsCard />
                    </motion.div>
                  )}
                  <motion.div {...bounceIn(0.12 + index * 0.05)} className="w-[300px] md:w-[350px]">
                    <TeamPanel 
                      teamName={teamNames[teamId] || `Team ${teamId}`} 
                      teamId={teamId} 
                      players={teamPlayers} 
                      myNickname={nickname} 
                      avatarReactions={avatarReactions} 
                      onPromote={setPromoteTarget}
                    />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {pin && playerId && (
        <PlayerLobbyChat
          pin={pin}
          playerId={playerId}
          nickname={nickname}
          disabled={startCountdown !== null}
          onChatMessage={handleLobbyChatMessage}
        />
      )}

      {/* Scenery Suggestion Credit Badge */}
      {isClient && sceneryProviderNickname && (
        <div 
          className="fixed bottom-4 left-4 bg-[#1A1A24]/90 border-[2px] border-black text-white text-sm font-black tracking-widest px-5 py-2.5 rounded-md backdrop-blur-md z-30 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-outfit)' }}
        >
          <span>🌄 Scenery by</span>
          <span className="text-[#FFCD29]">{sceneryProviderNickname}</span>
        </div>
      )}

      {/* Suggest Scenery Button */}
      {isClient && ownedScenery && ownedScenery.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSceneryPickerOpen(true)}
          className="fixed top-6 right-6 z-40 flex items-center gap-2 bg-[#FFCD29] text-black border-[2px] border-black px-4 py-2 rounded-md font-black uppercase text-xs tracking-wider"
        >
          🌄 Suggest Scenery
        </motion.button>
      )}

      {/* Scenery Picker Modal */}
      <AnimatePresence>
        {isSceneryPickerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSceneryPickerOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-[3px]"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-2xl bg-zk-panel-bg border-[2px] border-black rounded-md p-6 flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-black/10 shrink-0">
                <div>
                  <h3 className="font-['Outfit'] font-black text-2xl text-black">
                    Suggest Scenery
                  </h3>
                  <p className="text-xs font-bold text-black/60 mt-1">
                    Suggest one of your owned background skins for this game room
                  </p>
                </div>
                <button
                  onClick={() => setIsSceneryPickerOpen(false)}
                  className="w-8 h-8 rounded-md border-[2px] border-black bg-[#E74C3C] text-white flex items-center justify-center font-black text-sm hover:brightness-95 active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Grid content */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pr-1 scrollbar-none py-1">
                {ownedScenery.map((scenery) => {
                  const isCurrent = scenery.image === bgImage;
                  return (
                    <button
                      key={scenery.id}
                      type="button"
                      onClick={() => {
                        const socket = getSocket();
                        if (socket && isConnected) {
                          socket.emit('lobby:suggest-scenery', { pin, playerId, background: scenery.image });
                          setIsSceneryPickerOpen(false);
                        }
                      }}
                      className="group relative flex flex-col rounded-md border-[2px] overflow-hidden text-left bg-white transition-all border-black hover:scale-[1.01] active:scale-95"
                    >
                      {/* Image Preview */}
                      <div className="w-full aspect-[16/10] overflow-hidden relative border-b-[2px] border-black bg-black/10 shrink-0">
                        <img 
                          src={scenery.image} 
                          alt={scenery.name} 
                          className="w-full h-full object-cover" 
                        />
                        {isCurrent && (
                          <div className="absolute top-2 left-2 bg-[#FFCD29] text-black border-[2px] border-black rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            Active
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 flex-1 flex flex-col justify-center">
                        <span className="block text-sm font-black text-black truncate w-full">
                          {scenery.name}
                        </span>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zk-blue mt-0.5">
                          {isCurrent ? 'Currently Equipped' : 'Suggest Background'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leader Promotion Confirmation Modal */}
      {isClient && promoteTarget && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4">
          <div className="bg-zk-panel-bg border-[2px] border-black rounded-md p-6 max-w-sm w-full flex flex-col items-center text-center">
            <h3 className="font-['Outfit'] font-black text-xl text-zk-text mb-2 uppercase">
              Promote to Leader
            </h3>
            <p className="text-sm font-bold text-zk-text/60 mb-6">
              Are you sure you want to promote <span className="text-zk-text font-black">{promoteTarget.nickname}</span> to team leader? You will become a regular member.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setPromoteTarget(null)}
                className="flex-1 px-4 py-2 bg-white border-[2px] border-black text-black font-black uppercase text-[10px] tracking-wider rounded-md transition-all hover:bg-gray-100 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const socket = getSocket();
                  if (socket && isConnected && pin && playerId) {
                    socket.emit('lobby:grant-leader', { pin, playerId, targetPlayerId: promoteTarget.id });
                  }
                  setPromoteTarget(null);
                }}
                className="flex-1 px-4 py-2 bg-zk-blue border-[2px] border-black text-white font-black uppercase text-[10px] tracking-wider rounded-md transition-all hover:brightness-105 active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

