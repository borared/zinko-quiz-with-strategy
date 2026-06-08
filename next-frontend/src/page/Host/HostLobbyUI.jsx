"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
;
import QRCode from 'react-qr-code';

const AVATARS = ['🦊', '🐸', '🐼', '🦋', '🐯', '🦁', '🐧', '🦄', '🐺', '🦉', '🐻', '🦝'];

function getAvatar(nickname) {
  return AVATARS[nickname.charCodeAt(0) % AVATARS.length];
}

function PlayerSlot({ player, teamColor }) {
  const darkColor = teamColor === 'green' ? '#1a7a2e' : '#8b1a1a';

  if (!player) {
    return (
      <div
        className="w-full aspect-square border-[2px] border-dashed flex items-center justify-center rounded"
        style={{ borderColor: darkColor, backgroundColor: darkColor }}
      >
        <span className="text-white text-[10px] font-black uppercase opacity-50">Empty</span>
      </div>
    );
  }

  return (
    <div
      className="w-full aspect-square border-[2px] border-white flex flex-col items-center justify-center relative overflow-hidden rounded"
      style={{ backgroundColor: darkColor }}
    >
      <div className="absolute inset-0 bg-white/10" />
      <span className="text-3xl mb-1 relative z-10">{getAvatar(player.nickname)}</span>
      <span className="text-white font-black text-xs uppercase tracking-wider relative z-10 px-1 text-center truncate w-full">
        {player.nickname}
      </span>
    </div>
  );
}

function TeamPanel({ teamName, teamColor, players }) {
  const bgColor = teamColor === 'green' ? '#2ea84a' : '#c0392b';
  const shadowColor = teamColor === 'green' ? '#1a6b2e' : '#7b1515';
  const slots = [...players, ...Array(Math.max(0, 4 - players.length)).fill(null)];

  return (
    <div
      className="flex-1 border-[4px] border-black p-4 flex flex-col gap-3 rounded-lg"
      style={{ backgroundColor: bgColor, boxShadow: `6px 6px 0px 0px ${shadowColor}` }}
    >
      <div className="flex items-center justify-between">
        <span className="font-black text-xl text-white uppercase">{teamName}</span>
        <div className="bg-white border-[2px] border-black px-2 py-0.5 rounded">
          <span className="font-black text-[10px] text-black uppercase">{players.length}/4</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {slots.map((player, i) => (
          <PlayerSlot key={i} player={player} teamColor={teamColor} />
        ))}
      </div>
    </div>
  );
}

function VsCard() {
  return (
    <div
      className="flex-shrink-0 w-16 h-20 bg-[#1a1a6e] border-[4px] border-[#5D3FD3] flex items-center justify-center rounded-lg"
      style={{ boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}
    >
      <span className="font-black text-white text-2xl uppercase">VS</span>
    </div>
  );
}

export default function HostLobbyUI() {
  const { pin } = useParams();
  const [players] = useState([
    { nickname: 'Player 1', team: 'A' },
    { nickname: 'Player 2', team: 'B' },
    { nickname: 'Player 3', team: 'A' }
  ]);
  const [countdown, setCountdown] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStart = () => {
    if (players.length === 0) return;
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const gameUrl = isMounted ? `${window.location.origin}/join?pin=${pin}` : '';
  const teamA = players.filter(p => p.team === 'A');
  const teamB = players.filter(p => p.team === 'B');

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 to-black flex flex-col items-center justify-center p-6 gap-6">
      <h1 className="text-5xl font-black text-white uppercase" style={{ WebkitTextStroke: '2px #1a1a1a' }}>
        Host Lobby
      </h1>

      <div className="flex items-center gap-4">
        <div className="bg-white border-4 border-black rounded-lg p-3" style={{ boxShadow: '4px 4px rgba(0,0,0,1)' }}>
          <QRCode value={gameUrl} size={80} />
          <span className="text-[9px] font-black text-black text-center mt-1 block">Scan to Join</span>
        </div>
        <div className="bg-green-400 border-4 border-black text-black font-black px-4 py-3 rounded-lg text-xs uppercase">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-700 rounded-full" />
            <span>Live</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-400 border-4 border-black rounded-lg px-6 py-3" style={{ boxShadow: '4px 4px rgba(0,0,0,1)' }}>
        <p className="text-xs font-black text-black uppercase mb-1">Game PIN</p>
        <p className="text-4xl font-black text-black">{pin}</p>
      </div>

      <div className="flex gap-4 w-full max-w-4xl flex-1 max-h-80">
        <TeamPanel teamName="Team A" teamColor="green" players={teamA} />
        <VsCard />
        <TeamPanel teamName="Team B" teamColor="red" players={teamB} />
      </div>

      <button
        onClick={handleStart}
        disabled={players.length === 0 || countdown !== null}
        className="px-16 py-4 bg-yellow-400 border-4 border-black rounded-lg font-black text-2xl text-black uppercase"
        style={{ boxShadow: '4px 4px rgba(0,0,0,1)' }}
      >
        {countdown !== null ? countdown : 'Start Battle!'}
      </button>
    </div>
  );
}
