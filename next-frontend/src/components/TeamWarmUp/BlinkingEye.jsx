"use client";
import { motion } from 'framer-motion';

// A cute floating eye that blinks by scaling Y to near-zero
const BlinkingEye = ({ size = 60, x, y, delay = 0, pupilColor = '#1a1a1a' }) => {
  return (
    <motion.div
      animate={{ y: [-8, 8, -8] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      className="absolute pointer-events-none"
      style={{ width: size, height: size * 0.55, left: x, top: y }}
    >
      {/* Eye white (oval) */}
      <motion.div
        className="w-full h-full rounded-full bg-white border-[3px] border-zk-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden"
        animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay + 1.5,
          times: [0, 0.4, 0.5, 0.6, 1],
        }}
      >
        {/* Pupil */}
        <div
          className="rounded-full border-[2px] border-zk-black"
          style={{
            width: size * 0.38,
            height: size * 0.38,
            backgroundColor: pupilColor,
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default BlinkingEye;
