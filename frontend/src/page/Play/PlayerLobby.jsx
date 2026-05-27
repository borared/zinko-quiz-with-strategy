import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';

/* ── Shared animation helper ─────────────────────────────────────────────── */
const bounceIn = (delay = 0) => ({
  initial: { scale: 0, opacity: 0, y: 50 },
  animate: { scale: 1, opacity: 1, y: 0 },
  transition: { delay, type: 'spring', stiffness: 380, damping: 18, mass: 0.9 },
});

/* ── Random battle backgrounds (same pool as TeamWarmUp) ─────────────────── */
const backgrounds = [
  '/background_battle/forest.jpg',
  '/background_battle/city.jpg',
  '/background_battle/farm.jpg',
];

/* ── Avatars ─────────────────────────────────────────────────────────────── */
const AVATARS = ['🦊', '🐸', '🐼', '🦋', '🐯', '🦁', '🐧', '🦄', '🐺', '🦉', '🐻', '🦝'];
const getAvatar = (nickname) => AVATARS[nickname.charCodeAt(0) % AVATARS.length];

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
        className="w-full h-full rounded-full bg-white border-[3px] border-[#000000] flex items-center justify-center overflow-hidden"
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
function PlayerSlot({ player, isFirst, color, isMe }) {
  const darkColor = color === 'green' ? '#1a7a2e' : '#8b1a1a';
  const myHighlight = isMe ? 'border-[#FFCD29] border-[4px]' : 'border-white border-[2px]';

  if (!player) {
    return (
      <div
        className="w-full aspect-square border-[2px] border-dashed flex flex-col items-center justify-center"
        style={{ borderColor: darkColor, backgroundColor: darkColor }}
      >
        {isFirst && (
          color === 'green'
            ? <Users size={28} color="white" opacity={0.9} />
            : <Zap size={28} color="white" opacity={0.9} />
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
      className={`w-full aspect-square ${myHighlight} flex flex-col items-center justify-center relative overflow-hidden rounded`}
      style={{ backgroundColor: darkColor }}
    >
      {isMe && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 bg-[#FFCD29]/30 pointer-events-none"
        />
      )}
      <div className="absolute inset-0 bg-white/10" />
      <span className="text-3xl mb-1 relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
        {getAvatar(player.nickname)}
      </span>
      <span className="text-white font-black text-xs uppercase tracking-wider relative z-10 px-1 text-center truncate w-full">
        {player.nickname}
      </span>
      {isMe && (
        <span className="absolute top-1 right-1 text-[8px] bg-[#FFCD29] text-black px-1 rounded font-bold z-20">
          YOU
        </span>
      )}
    </div>
  );
}

/* ─── TeamPanel ──────────────────────────────────────────────────────────── */
function TeamPanel({ teamName, color, players, myNickname }) {
  const bgColor = color === 'green' ? '#2ea84a' : '#c0392b';
  const shadowColor = color === 'green' ? '#1a6b2e' : '#7b1515';
  const slots = [...players, ...Array(Math.max(0, 4 - players.length)).fill(null)];

  return (
    <div
      className="w-full border-[4px] border-[#000000] p-4 flex flex-col gap-3 rounded-xl"
      style={{ backgroundColor: bgColor, boxShadow: `6px 6px 0px 0px ${shadowColor}` }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <span className="font-black text-xl text-white uppercase tracking-wider">
          {teamName}
        </span>
        <div className="bg-white border-[2px] border-[#000000] px-2 py-0.5 rounded-xl">
          <span className="font-black text-[10px] text-[#000000] uppercase tracking-wider">
            Player Count: {players.length}
          </span>
        </div>
      </div>

      {/* 2×2 player grid */}
      <div className="grid grid-cols-2 gap-2">
        {slots.map((player, i) => (
          <PlayerSlot 
            key={i} 
            player={player} 
            isFirst={i === 0 && !player} 
            color={color} 
            isMe={player && player.nickname === myNickname}
          />
        ))}
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

export default function PlayerLobby() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { getSocket, isConnected } = useSocket();

  const nickname = sessionStorage.getItem('player_nickname') || 'Player';
  const team     = sessionStorage.getItem('player_team') || 'A';
  const playerId = sessionStorage.getItem('player_id');

  const [bgImage, setBgImage] = useState(backgrounds[0]);
  const [players, setPlayers] = useState([]);

  // Pick a random background on mount
  useEffect(() => {
    setBgImage(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
  }, []);

  // Socket logic
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected) return;

    // Trigger an upsert to fetch the latest player list
    if (playerId) {
      socket.emit('player:join', { pin, playerId, nickname, team });
    }

    const onPlayersUpdate = (data) => {
      setPlayers(data.players || []);
    };

    const onQuestion = (data) => {
      navigate(`/play/game/${pin}`, { state: { question: data } });
    };

    socket.on('lobby:players-update', onPlayersUpdate);
    socket.on('game:question', onQuestion);

    return () => {
      socket.off('lobby:players-update', onPlayersUpdate);
      socket.off('game:question', onQuestion);
    };
  }, [getSocket, isConnected, pin, navigate, nickname, team, playerId]);

  const teamAPlayers = players.filter((p) => p.team === 'A');
  const teamBPlayers = players.filter((p) => p.team === 'B');

  return (
    <div
      className="relative w-full h-screen max-h-screen overflow-hidden flex flex-col font-sans pt-6 pb-24 px-6"
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
              style={{ backgroundColor: '#000000' }}
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

        {/* Team Panels Container */}
        <div className="flex-1 flex flex-row items-center justify-center gap-2 md:gap-6 w-full max-w-5xl mx-auto min-h-0">
          <motion.div {...bounceIn(0.12)} className="flex-1 w-full max-w-[380px]">
            <TeamPanel teamName="Team A" color="green" players={teamAPlayers} myNickname={nickname} />
          </motion.div>

          <motion.div {...bounceIn(0.2)}>
            <VsCard />
          </motion.div>

          <motion.div {...bounceIn(0.12)} className="flex-1 w-full max-w-[380px]">
            <TeamPanel teamName="Team B" color="red" players={teamBPlayers} myNickname={nickname} />
          </motion.div>
        </div>

      </div>

    </div>
  );
}
