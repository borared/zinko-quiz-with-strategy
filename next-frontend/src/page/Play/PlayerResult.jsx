"use client";
import React from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
;
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function PlayerResult() {
  const { pin } = useParams();
  const location = usePathname();
  const router = useRouter();

  const leaderboard = location.state?.leaderboard || [];
  const myEntry     = location.state?.myEntry;
  const myRank      = myEntry?.rank ?? '?';

  const rankMessages = {
    1: 'You dominated! 👑',
    2: 'So close to the top! 🔥',
    3: 'Podium finish! 🎉',
  };
  const rankMsg = rankMessages[myRank] || `You placed #${myRank}`;

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex flex-col items-center justify-between px-6 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-[#FFCD29] opacity-10 blur-[100px] pointer-events-none" />

      {/* ── Personal rank card ── */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-7xl mb-4"
        >
          {MEDAL[myRank - 1] || '🎮'}
        </motion.div>

        <h1 className="text-white font-black text-4xl mb-1">{rankMsg}</h1>
        <p className="text-white/50 text-sm mb-6 uppercase tracking-widest">
          {myEntry?.nickname || 'You'}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Final Score</p>
            <p className="text-[#FFCD29] font-black text-2xl">{myEntry?.score?.toLocaleString() ?? 0}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Rank</p>
            <p className="text-white font-black text-2xl">#{myRank}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Top 5 leaderboard ── */}
      <div className="w-full max-w-sm">
        <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-3 text-center">
          Top Players
        </p>
        <div className="space-y-2">
          {leaderboard.slice(0, 5).map((player, i) => {
            const isMe = player.id === myEntry?.id;
            return (
              <motion.div
                key={player.id}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.07 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
                  isMe
                    ? 'bg-[#FFCD29]/20 border-[#FFCD29]/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className="text-xl w-8 text-center">{MEDAL[i] || `#${i + 1}`}</span>
                <p className={`flex-1 font-bold text-sm ${isMe ? 'text-[#FFCD29]' : 'text-white'}`}>
                  {player.nickname} {isMe && '(You)'}
                </p>
                <p className="text-white font-black text-sm">{player.score?.toLocaleString()}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        id="back-home-btn"
        onClick={() => router.push('/')}
        className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/20 transition-colors"
      >
        <Home size={18} /> Back to Home
      </motion.button>
    </div>
  );
}
