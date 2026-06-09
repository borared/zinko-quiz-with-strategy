"use client";
import { motion } from 'framer-motion';

const VsCard = () => {
  return (
    <motion.div
      animate={{ rotate: [-6, 6, -6], scale: [1, 1.08, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className="flex-shrink-0 w-16 h-20 bg-[#1a1a6e] border-[4px] border-[#5D3FD3] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
    >
      <span className="font-black text-white text-2xl uppercase tracking-tighter">VS</span>
    </motion.div>
  );
};

export default VsCard;
