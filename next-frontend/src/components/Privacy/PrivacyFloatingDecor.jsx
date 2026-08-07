"use client";

import { motion } from 'framer-motion';

const CANDY_CORN_SRC =
  'https://res.cloudinary.com/dicrvjstp/image/upload/v1777969164/Screenshot_2026-05-05_133201_c3kyvs.png';
const LIGHTNING_SRC =
  'https://res.cloudinary.com/dicrvjstp/image/upload/v1777969164/Screenshot_2026-05-05_133406_nh0a38.png';

export default function PrivacyFloatingDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Candy corn mascot — top left */}
      <motion.div
        animate={{ y: [-12, 12, -12], rotate: [-4, 4, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[6%] left-[1%] w-28 sm:w-36 md:w-44 lg:w-52 opacity-90"
      >
        <img
          src={CANDY_CORN_SRC}
          alt=""
          className="w-full h-auto object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.25)]"
        />
      </motion.div>

      {/* Lightning bolt mascot — bottom right */}
      <motion.div
        animate={{ y: [10, -10, 10], rotate: [3, -3, 3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute bottom-[8%] right-[1%] w-28 sm:w-36 md:w-44 lg:w-52 opacity-90"
      >
        <img
          src={LIGHTNING_SRC}
          alt=""
          className="w-full h-auto object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.25)]"
        />
      </motion.div>

      {/* Accent shapes — hero-inspired geometry */}
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: [0, 180, 360] }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 14, repeat: Infinity, ease: 'linear' },
        }}
        className="absolute top-[18%] right-[8%] hidden md:block w-14 h-14 bg-zk-blue border-[3px] border-zk-border shadow-[3px_3px_0_0_#000] rounded-xl"
      />
      <motion.div
        animate={{ y: [8, -8, 8] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="absolute bottom-[22%] left-[10%] hidden md:block w-10 h-10 bg-[#FF6B6B] border-[3px] border-zk-border shadow-[3px_3px_0_0_#000] rounded-full"
      />
      <motion.div
        animate={{ y: [-6, 6, -6], rotate: [-6, 6, -6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-[55%] right-[4%] hidden lg:block w-16 h-16 bg-[#6E5CF2] border-[3px] border-zk-border shadow-[4px_4px_0_0_#000] rounded-xl"
      />
    </div>
  );
}