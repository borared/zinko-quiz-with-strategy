"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useSocketStore } from '@/store/useSocketStore';
import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
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
  initial: { scale: 0.96, opacity: 0, y: 15 },
  animate: { scale: 1, opacity: 1, y: 0 },
  transition: { delay, duration: 0.32, ease: [0.16, 1, 0.3, 1] },
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

function PlayerSlot({ player, isFirst, teamId }) {
  const theme = TEAM_THEMES[teamId] || TEAM_THEMES.A;
  const darkColor = theme.dark;
  const Icon = theme.icon;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player ? player.id : `empty-${teamId}-${Math.random()}`,
    data: player ? { teamId, playerId: player.id } : {},
    disabled: !player
  });

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

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{ backgroundColor: darkColor, ...style }}
      {...listeners}
      {...attributes}
      className="w-full aspect-square border-[2px] border-white flex flex-col items-center justify-center relative overflow-hidden rounded cursor-grab active:cursor-grabbing"
    >
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
    </div>
  );
}

/* ─── TeamPanel ──────────────────────────────────────────────────────────── */
function TeamPanel({ teamName, teamId, players }) {
  const theme = TEAM_THEMES[teamId] || TEAM_THEMES.A;
  const bgColor = theme.bg;
  const shadowColor = theme.shadow;
  const slots = [...players, ...Array(Math.max(0, 4 - players.length)).fill(null)];

  const { setNodeRef, isOver } = useDroppable({
    id: teamId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-full border-[4px] border-[#000000] p-4 flex flex-col gap-3 rounded-xl transition-all ${isOver ? 'scale-[1.02] ring-4 ring-white' : ''}`}
      style={{ backgroundColor: bgColor, boxShadow: `6px 6px 0px 0px ${shadowColor}` }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <span className="font-black text-xl text-white tracking-wider">
          {teamName}
        </span>
        <div className="bg-zk-panel-bg border-[2px] border-[#000000] px-2 py-[2px] rounded-xl flex items-center justify-center">
          <span className="font-black text-[10px] text-[#000000] tracking-wider leading-none mt-[2px]">
            Player Count: {players.length}
          </span>
        </div>
      </div>

      {/* 2×2 player grid */}
      <div className="grid grid-cols-2 gap-2">
        {slots.map((player, i) => (
          <PlayerSlot key={i} player={player} isFirst={i === 0 && !player} teamId={teamId} />
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
  const [teams, setTeams] = useState(['A', 'B']);
  const [teamNames, setTeamNames] = useState({});
  const [startCountdown, setStartCountdown] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isQRExpanded, setIsQRExpanded] = useState(false);

  const scrollContainerRef = useRef(null);
  const prevTeamsLengthRef = useRef(teams.length);

  useEffect(() => {
    if (teams.length > prevTeamsLengthRef.current) {
      if (scrollContainerRef.current) {
        setTimeout(() => {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
    prevTeamsLengthRef.current = teams.length;
  }, [teams.length]);

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
      if (data.teams) setTeams(data.teams);
      if (data.teamNames) setTeamNames(data.teamNames);
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
    socket.on('host:sync-state-response', onInitialized);
    socket.on('lobby:players-update', onPlayersUpdate);
    socket.on('lobby:background-update', onBackgroundUpdate);
    socket.on('error', onError);

    return () => {
      socket.off('host:initialized', onInitialized);
      socket.off('host:sync-state-response', onInitialized);
      socket.off('lobby:players-update', onPlayersUpdate);
      socket.off('lobby:background-update', onBackgroundUpdate);
      socket.off('error', onError);
    };
  }, [getSocket, isConnected, pin, router]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (over && active.data.current?.teamId !== over.id) {
      const socket = getSocket();
      if (socket && isConnected && pin) {
        socket.emit('lobby:move-player', {
          pin,
          playerId: active.id,
          newTeam: over.id
        });
      }
    }
  }, [getSocket, isConnected, pin]);

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
          onClick={() => setIsQRExpanded(true)}
          className="bg-zk-panel-bg border-[4px] border-[#000000] rounded-xl p-3 flex flex-col items-center justify-center w-36 md:w-44 cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="w-full flex justify-center aspect-square">
            {isMounted && gameUrl && (
              <QRCode value={gameUrl} style={{ width: '100%', height: '100%' }} level="H" />
            )}
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
            <div className="flex gap-2 mt-2">
              <div
                className="inline-flex items-center justify-center text-white font-black text-xs md:text-sm px-5 rounded-md leading-none pt-2.5 pb-2"
                style={{ backgroundColor: '#000000' }}
              >
                Waiting for Players
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Panels Container */}
        <DndContext onDragEnd={handleDragEnd}>
          <div ref={scrollContainerRef} className="flex-1 flex flex-row flex-wrap items-center justify-center gap-4 w-full max-w-6xl mx-auto min-h-0 overflow-y-auto scrollbar-hide content-start pt-4 pb-8">
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
                    <TeamPanel teamName={teamNames[teamId] || `Team ${teamId}`} teamId={teamId} players={teamPlayers} />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>

      {/* ── Add/Remove Team Buttons (Right Edge Above Bottom Bar) ──────────────── */}
      <motion.div
        {...bounceIn(0.2)}
        className="absolute right-6 bottom-24 z-30 flex flex-col items-end gap-3"
      >
        <button
          onClick={() => {
            const socket = getSocket();
            if (socket && isConnected && pin) {
              socket.emit('lobby:add-team', { pin });
            }
          }}
          disabled={teams.length >= 9 || startCountdown !== null}
          className="inline-flex items-center justify-center font-black text-xs md:text-sm px-6 bg-zk-panel-bg border-[2px] border-black text-black hover:bg-gray-200 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400 rounded-xl leading-none py-3 cursor-pointer disabled:cursor-not-allowed w-full no-click-sound"
        >
          + Add Team
        </button>
        {teams.length > 2 && (
          <button
            onClick={() => {
              const socket = getSocket();
              if (socket && isConnected && pin) {
                socket.emit('lobby:remove-team', { pin });
              }
            }}
            disabled={startCountdown !== null || players.some(p => p.team === teams[teams.length - 1])}
            className="inline-flex items-center justify-center font-black text-xs md:text-sm px-6 bg-red-500 border-[2px] border-black text-white hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400 rounded-xl leading-none py-3 cursor-pointer disabled:cursor-not-allowed w-full no-click-sound"
            title={players.some(p => p.team === teams[teams.length - 1]) ? "Cannot remove team with players" : "Remove last team"}
          >
            - Remove Team
          </button>
        )}
      </motion.div>

      {/* ── Start Button (bottom bar fixed) ──────────────────────────────────── */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute bottom-0 left-0 w-full py-4 flex items-center justify-center z-40"
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
            disabled={players.length === 0 || new Set(teams.map(t => players.filter(p => p.team === t).length)).size > 1 || startCountdown !== null}
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

      {/* Expanded QR Modal */}
      {isQRExpanded && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center cursor-pointer p-6"
          onClick={() => setIsQRExpanded(false)}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-zk-panel-bg border-[8px] border-[#000000] rounded-3xl p-8 flex flex-col items-center justify-center max-w-sm md:max-w-md w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full aspect-square mb-6">
              <QRCode value={gameUrl} style={{ width: '100%', height: '100%' }} level="H" />
            </div>
            <span
              className="text-3xl font-black uppercase text-center tracking-widest"
              style={{ color: '#000000' }}
            >
              Scan to Join
            </span>
            <p className="mt-4 text-2xl gasoek-one-regular tracking-widest text-[#5D3FD3]">
              PIN: {pin}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
