"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function FrogSteal({ isActive }) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="text-8xl drop-shadow-2xl">🐸</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
