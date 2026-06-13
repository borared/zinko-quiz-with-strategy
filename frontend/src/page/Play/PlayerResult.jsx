import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function PlayerResult() {
  const { pin } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-zk-yellow flex flex-col items-center justify-between px-6 py-10 relative overflow-hidden font-sans">
      {/* Decorative floating shapes */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-10 w-20 h-20 rounded-full bg-[#5D3FD3] border-[4px] border-zk-black shadow-[4px_4px_0_#000] pointer-events-none"
      />
      <motion.div
        animate={{ y: [10, -10, 10], rotate: [45, 60, 45] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 right-10 w-24 h-24 rotate-45 bg-[#FF6B4A] border-[4px] border-zk-black shadow-[4px_4px_0_#000] pointer-events-none rounded-xl"
      />

      {/* ── Personal rank card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative z-10 w-full max-w-sm text-center bg-white border-[4px] border-zk-black shadow-[8px_8px_0_#000] rounded-2xl p-6 mt-8"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-7xl mb-4 -mt-14 drop-shadow-[0_4px_0_rgba(0,0,0,1)]"
        >
          {MEDAL[myRank - 1] || '🎮'}
        </motion.div>

        <h1 className="text-zk-black font-black text-3xl mb-1 uppercase tracking-tight permanent-marker-regular">
          {rankMsg}
        </h1>
        <p className="text-zk-black/50 font-black text-sm mb-6 uppercase tracking-widest">
          {myEntry?.nickname || 'Player'}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="bg-[#5D3FD3] border-[3px] border-zk-black rounded-xl p-4 shadow-[4px_4px_0_#000]">
            <p className="text-white/80 font-black text-[10px] uppercase tracking-widest mb-1">Final Score</p>
            <p className="text-[#FFCD29] font-black text-2xl drop-shadow-[2px_2px_0_#000]">
              {myEntry?.score?.toLocaleString() ?? 0}
            </p>
          </div>
          <div className="bg-[#FF6B4A] border-[3px] border-zk-black rounded-xl p-4 shadow-[4px_4px_0_#000]">
            <p className="text-white/80 font-black text-[10px] uppercase tracking-widest mb-1">Rank</p>
            <p className="text-white font-black text-3xl drop-shadow-[2px_2px_0_#000]">
              #{myRank}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Top 5 leaderboard ── */}
      <div className="relative z-10 w-full max-w-sm mt-8">
        <div className="bg-white border-[4px] border-zk-black shadow-[6px_6px_0_#000] rounded-2xl p-5">
          <p className="text-zk-black font-black text-sm uppercase tracking-widest mb-4 text-center permanent-marker-regular">
            Top Players
          </p>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((player, i) => {
              const isMe = player.id === myEntry?.id;
              return (
                <motion.div
                  key={player.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[3px] border-zk-black shadow-[2px_2px_0_#000] ${
                    isMe
                      ? 'bg-[#FFCD29] translate-x-2'
                      : 'bg-zinc-100'
                  }`}
                >
                  <span className="text-xl w-8 text-center font-black drop-shadow-[1px_1px_0_#000]">{MEDAL[i] || `#${i + 1}`}</span>
                  <p className={`flex-1 font-black text-sm truncate ${isMe ? 'text-zk-black' : 'text-zk-black/70'}`}>
                    {player.nickname} {isMe && '(You)'}
                  </p>
                  <p className="text-zk-black font-black text-sm">{player.score?.toLocaleString()}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        id="back-home-btn"
        onClick={() => navigate('/')}
        className="relative z-10 mt-10 mb-4 flex items-center justify-center gap-2 px-8 py-4 w-full max-w-sm rounded-xl bg-[#3B68FF] border-[4px] border-zk-black text-white font-black text-lg uppercase tracking-widest shadow-[4px_4px_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_#000] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
      >
        <Home size={22} /> Back to Home
      </motion.button>
    </div>
  );
}
