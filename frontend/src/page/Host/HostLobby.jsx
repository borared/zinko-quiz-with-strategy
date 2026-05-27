import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import QRCodePackage from 'react-qr-code';

// Handle commonJS/ESM interop issues with react-qr-code
const QRCode = typeof QRCodePackage === 'function' 
  ? QRCodePackage 
  : (QRCodePackage.default || QRCodePackage.QRCode || QRCodePackage);

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
function PlayerSlot({ player, isFirst, color }) {
  const darkColor = color === 'green' ? '#1a7a2e' : '#8b1a1a';

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
      className="w-full aspect-square border-[2px] border-white flex flex-col items-center justify-center relative overflow-hidden rounded"
      style={{ backgroundColor: darkColor }}
    >
      <div className="absolute inset-0 bg-white/10" />
      <span className="text-3xl mb-1 relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
        {getAvatar(player.nickname)}
      </span>
      <span className="text-white font-black text-xs uppercase tracking-wider relative z-10 px-1 text-center truncate w-full">
        {player.nickname}
      </span>
    </div>
  );
}

/* ─── TeamPanel ──────────────────────────────────────────────────────────── */
function TeamPanel({ teamName, color, players }) {
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
          <PlayerSlot key={i} player={player} isFirst={i === 0 && !player} color={color} />
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

/* ═══════════════════════════════════════════════════════════════════════════
   HostLobby – main exported component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function HostLobby() {
  const { pin } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getSocket, isConnected } = useSocket();

  const [bgImage, setBgImage] = useState(backgrounds[0]);
  const [players, setPlayers] = useState([]);
  const [startCountdown, setStartCountdown] = useState(null);

  // Pick a random background on mount
  useEffect(() => {
    setBgImage(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
  }, []);

  // Connect to socket and get real players
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected) return;

    socket.emit('host:initialize', { pin, quizId: location.state?.quizId });

    const onPlayersUpdate = (data) => {
      setPlayers(data.players || []);
    };

    socket.on('lobby:players-update', onPlayersUpdate);

    return () => {
      socket.off('lobby:players-update', onPlayersUpdate);
    };
  }, [getSocket, isConnected, pin, location.state]);

  const handleStartGame = useCallback(() => {
    if (players.length === 0) return;
    setStartCountdown(3);
    const interval = setInterval(() => {
      setStartCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(`/host/game/${pin}`, { state: location.state });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [players.length, navigate, pin, location.state]);

  const gameUrl = `${window.location.origin}/join?pin=${pin}`;
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

      {/* ── Top Right Edge: QR & PIN ───────────────────────────────────── */}
      <motion.div
        {...bounceIn(0.1)}
        className="absolute top-6 right-6 z-20 flex flex-col items-stretch gap-3 w-40 md:w-44"
      >
        {/* Game PIN */}
        <div
          className="border-[4px] border-[#000000] rounded-xl py-2.5 flex flex-col items-center justify-center text-center w-full"
          style={{ backgroundColor: '#FFCD29', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5"
            style={{ color: '#000000' }}
          >
            Game PIN
          </p>
          <p
            className="text-3xl md:text-4xl font-black tracking-wider leading-none"
            style={{ color: '#000000' }}
          >
            {pin || '????'}
          </p>
        </div>

        {/* QR Code */}
        <div
          className="bg-white border-[4px] border-[#000000] rounded-xl p-3 flex flex-col items-center justify-center w-full"
          style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
        >
          <div className="w-full flex justify-center aspect-square">
            <QRCode value={gameUrl} style={{ width: '100%', height: '100%' }} level="H" />
          </div>
          <span
            className="text-[10px] font-black uppercase mt-2 text-center tracking-widest"
            style={{ color: '#000000' }}
          >
            Scan to Join
          </span>
        </div>
      </motion.div>

      {/* ── Content Container ──────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-6xl mx-auto pt-4">
        
        {/* Top Bar: Header Only */}
        <motion.div {...bounceIn(0)} className="w-full flex justify-center mb-6 lg:mb-10">
          <div className="flex flex-col items-center justify-start">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight permanent-marker-regular whitespace-nowrap"
              style={{ WebkitTextStroke: '3px #1a1a1a' }}
            >
              Host Lobby
            </h1>
            <div
              className="inline-block mt-2 text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] px-4 py-1.5"
              style={{ backgroundColor: '#000000' }}
            >
              Waiting for Players
            </div>
          </div>
        </motion.div>

        {/* Team Panels Container */}
        <div className="flex-1 flex flex-row items-center justify-center gap-2 md:gap-6 w-full max-w-5xl mx-auto min-h-0">
          <motion.div {...bounceIn(0.12)} className="flex-1 w-full max-w-[380px]">
            <TeamPanel teamName="Team A" color="green" players={teamAPlayers} />
          </motion.div>

          <motion.div {...bounceIn(0.2)}>
            <VsCard />
          </motion.div>

          <motion.div {...bounceIn(0.12)} className="flex-1 w-full max-w-[380px]">
            <TeamPanel teamName="Team B" color="red" players={teamBPlayers} />
          </motion.div>
        </div>

      </div>

      {/* ── Start Button (bottom bar fixed) ──────────────────────────────────── */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute bottom-0 left-0 w-full py-4 flex items-center justify-center z-20"
        style={{ backgroundColor: '#000000', borderTop: '4px solid #000000' }}
      >
        <button
          id="start-game-btn"
          onClick={handleStartGame}
          disabled={players.length === 0 || startCountdown !== null}
          className="px-16 py-3 border-[4px] border-[#000000] rounded-xl font-black text-xl uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#FFCD29', color: '#000000', boxShadow: '5px 5px 0px 0px rgba(0,0,0,1)' }}
        >
          {startCountdown !== null ? (
            <span className="text-4xl">{startCountdown}</span>
          ) : (
            <>Start Battle!</>
          )}
        </button>
      </motion.div>
    </div>
  );
}
