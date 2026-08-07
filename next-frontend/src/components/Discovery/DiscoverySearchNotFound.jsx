"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Search, RotateCcw } from 'lucide-react';

const DiscoverySearchNotFound = ({ query, onClear }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="relative flex flex-col items-center text-center py-10 md:py-14 px-4"
  >
    <h2
      className="permanent-marker-regular text-3xl md:text-4xl text-zk-text uppercase mb-2 tracking-tight"
    >
      Not Found
    </h2>

    <p className="text-base md:text-lg font-bold text-zk-text/70 max-w-md mb-2">
      No public quizzes match
    </p>
    <p className="text-sm font-bold text-zk-purple mb-8 max-w-sm">
      &ldquo;{query}&rdquo;
    </p>

    <div className="flex flex-col sm:flex-row gap-3">
      <button
        type="button"
        onClick={onClear}
        className="flex items-center justify-center gap-2 bg-zk-panel-bg text-zk-text border-[3px] border-zk-border px-6 py-2.5 rounded-xl font-bold text-sm uppercase !shadow-none transition-colors hover:bg-zk-bg/30"
      >
        <RotateCcw size={16} />
        Clear search
      </button>
    </div>

    <motion.div
      animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-4 left-6 w-10 h-10 bg-zk-coral border-[3px] border-zk-border rounded-lg !shadow-none opacity-80 pointer-events-none hidden md:block"
      aria-hidden="true"
    />
    <motion.div
      animate={{ y: [0, 6, 0], rotate: [0, -10, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute bottom-6 right-8 w-12 h-12 bg-zk-purple border-[3px] border-zk-border rounded-full !shadow-none opacity-80 pointer-events-none hidden md:block"
      aria-hidden="true"
    />
    <Search
      size={20}
      className="absolute top-8 right-10 text-zk-text/20 pointer-events-none hidden lg:block"
      aria-hidden="true"
    />
  </motion.div>
);

export default DiscoverySearchNotFound;