"use client";

import { motion } from 'framer-motion';
import LobbySticker from '@/components/Play/LobbySticker';

/** Game-style taunt sticker that pops above a player avatar. */
export default function AvatarEmojiBurst({ emoji, reactionId, index = 0 }) {
  const xOffset = (index % 3 - 1) * 12;

  return (
    <motion.div
      key={reactionId}
      initial={{ scale: 0, y: 8, opacity: 0, x: xOffset }}
      animate={{
        scale: [0, 1.45, 1.15, 1.05],
        y: [8, -20, -56, -80],
        opacity: [0, 1, 1, 0],
        x: xOffset,
      }}
      transition={{
        duration: 2.4,
        times: [0, 0.12, 0.55, 1],
        ease: 'easeOut',
      }}
      className="absolute left-1/2 top-[38%] z-30 pointer-events-none flex items-center justify-center"
      style={{ transform: 'translateX(-50%)' }}
    >
      <LobbySticker emoji={emoji} size="burst" />
    </motion.div>
  );
}