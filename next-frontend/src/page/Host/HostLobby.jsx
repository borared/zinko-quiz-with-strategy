"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
;
import { useSocketStore } from '@/store/useSocketStore';
import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import QRCodePackage from 'react-qr-code';
import LobbySceneryPicker from '@/components/Host/LobbySceneryPicker';
import ScenerySoundToggle from '@/components/Host/ScenerySoundToggle';
import { DEFAULT_LOBBY_SCENERY, getSceneryAudioSlugFromImage, isOwnedSceneryImage, setStoredGameBackground } from '@/lib/lobbyScenery';
import { useHalloweenSceneryAudio } from '@/hooks/useHalloweenSceneryAudio';
import { useOwnedSceneryStore } from '@/store/useOwnedSceneryStore';
import { useAuthStore } from '@/store/useAuthStore';

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
      
        <img 
          src={player.avatar || ''} 
          alt="avatar" 
          className="absolute inset-0 w-full h-full object-cover z-10"
        />

      <div className="absolute bottom-0 right-0 bg-white px-2 py-1 rounded-tl-lg z-20 border-t-[2px] border-l-[2px] border-[#000000]">
        <span className="text-[#000000] font-black text-[10px] md:text-xs uppercase tracking-wider relative block">
          {player.nickname}
        </span>
      </div>
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
  const location = usePathname();
  const router = useRouter();
  const { getSocket, isConnected } = useSocketStore();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);
  const {
    ownedScenery,
    newScenerySlugs,
    fetchOwnedScenery,
    getDefaultImage,
    syncNewScenerySlugs,
    acknowledgeNewScenery,
  } = useOwnedSceneryStore();

  const [bgImage, setBgImage] = useState(DEFAULT_LOBBY_SCENERY);
  const [players, setPlayers] = useState([]);
  const [startCountdown, setStartCountdown] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPin = useCallback(() => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pin]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isJwtReady) {
      fetchOwnedScenery();
      syncNewScenerySlugs();
    }
  }, [isJwtReady, fetchOwnedScenery, syncNewScenerySlugs]);

  useEffect(() => {
    const onNewSceneryChanged = () => syncNewScenerySlugs();
    window.addEventListener('newSceneryChanged', onNewSceneryChanged);
    return () => window.removeEventListener('newSceneryChanged', onNewSceneryChanged);
  }, [syncNewScenerySlugs]);

  useEffect(() => {
    if (!ownedScenery.length) return;
    if (!isOwnedSceneryImage(bgImage, ownedScenery)) {
      setBgImage(getDefaultImage());
    }
  }, [ownedScenery, bgImage, getDefaultImage]);

  useEffect(() => {
    if (pin && bgImage) setStoredGameBackground(pin, bgImage);
  }, [pin, bgImage]);

  // Connect to socket and get real players
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected) return;

    const storedQuizId = sessionStorage.getItem(`game_${pin}_quizId`);
    const token = localStorage.getItem('zinko_jwt');
    socket.emit('host:initialize', { pin, quizId: storedQuizId, token });

    const onInitialized = (data) => {
      if (data.background) setBgImage(data.background);
    };

    const onPlayersUpdate = (data) => {
      setPlayers(data.players || []);
      if (data.background) setBgImage(data.background);
    };

    const onBackgroundUpdate = (data) => {
      if (data.background) setBgImage(data.background);
    };

    const onError = (data) => {
      if (data.message === 'Game PIN not found.') {
        router.replace('/404');
      } else if (data.message === 'Unauthorized host') {
        router.replace('/unauthorized');
      }
    };

    socket.on('host:initialized', onInitialized);
    socket.on('lobby:players-update', onPlayersUpdate);
    socket.on('lobby:background-update', onBackgroundUpdate);
    socket.on('error', onError);

    return () => {
      socket.off('host:initialized', onInitialized);
      socket.off('lobby:players-update', onPlayersUpdate);
      socket.off('lobby:background-update', onBackgroundUpdate);
      socket.off('error', onError);
    };
  }, [getSocket, isConnected, pin, location.state, router]);

  const handleSceneryChange = useCallback((image) => {
    setBgImage(image);
    const socket = getSocket();
    if (socket && isConnected && pin) {
      socket.emit('lobby:set-background', { pin, background: image });
    }
  }, [getSocket, isConnected, pin]);

  useHalloweenSceneryAudio(bgImage, pin);

  const handleStartGame = useCallback(() => {
    if (players.length === 0) return;
    const socket = getSocket();
    if (socket && isConnected) {
      socket.emit('lobby:start-countdown', { pin });
    }
    
    setStartCountdown(3);
  }, [players.length, pin, getSocket, isConnected]);

  useEffect(() => {
    if (startCountdown === null) return;
    
    if (startCountdown === 0) {
      router.push(`/host/game/${pin}`);
      setStartCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setStartCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [startCountdown, router, pin]);

  const gameUrl = isMounted ? `${window.location.origin}/join?pin=${pin}` : '';
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
      <BlinkingEye size={40} x="88%" y="70%" delay={0.6} pupilColor="#c0392b" />
      <BlinkingEye size={45} x="3%" y="75%" delay={2} pupilColor="#2ea84a" />

      {/* Start Game Countdown Overlay */}
      {startCountdown !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <motion.div
            key={startCountdown}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1.5, 1], opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="text-[15rem] md:text-[20rem] font-black text-[#FFCD29] drop-shadow-[0_10px_0_rgba(0,0,0,1)] zinko-font"
            style={{ WebkitTextStroke: '8px #000000' }}
          >
            {startCountdown}
          </motion.div>
        </div>
      )}

      {/* ── Top Right Edge: QR & PIN ───────────────────────────────────── */}
      <motion.div
        {...bounceIn(0.1)}
        className="absolute top-6 right-6 z-20 flex flex-col items-end gap-3"
      >
        {/* Game PIN */}
        <div
          onClick={copyPin}
          className="flex flex-col items-end justify-center text-right cursor-pointer hover:scale-105 transition-transform"
          title="Click to copy"
        >
          <p
            className="text-sm md:text-lg font-black uppercase tracking-[0.2em] mb-[-5px] text-white pr-1"
            style={{ textShadow: '2px 2px 0px #000000' }}
          >
            {copied ? 'Copied!' : 'Game PIN'}
          </p>
          <p
            className="text-[4rem] md:text-[5.5rem] gasoek-one-regular tracking-widest leading-none text-white drop-shadow-[0_4px_0_rgba(0,0,0,1)]"
            style={{ WebkitTextStroke: '4px #000000' }}
          >
            {pin || '????'}
          </p>
        </div>

        {/* QR Code */}
        <div
          className="bg-white border-[4px] border-[#000000] rounded-xl p-3 flex flex-col items-center justify-center w-36 md:w-44"
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
        <motion.div
          {...bounceIn(0.05)}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30"
        >
          <ScenerySoundToggle
            visible={Boolean(getSceneryAudioSlugFromImage(bgImage))}
            scenerySlug={getSceneryAudioSlugFromImage(bgImage)}
            disabled={startCountdown !== null}
          />
        </motion.div>

        <motion.div
          {...bounceIn(0.05)}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30"
        >
          <LobbySceneryPicker
            currentImage={bgImage}
            ownedScenery={ownedScenery}
            newScenerySlugs={newScenerySlugs}
            onSelect={handleSceneryChange}
            onAcknowledgeNew={acknowledgeNewScenery}
            disabled={startCountdown !== null}
          />
        </motion.div>

        <button
          id="start-game-btn"
          onClick={handleStartGame}
          disabled={teamAPlayers.length === 0 || teamAPlayers.length !== teamBPlayers.length || startCountdown !== null}
          className="px-16 py-1 border-[4px] border-[#000000] rounded-xl amatic-sc-regular text-4xl uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

