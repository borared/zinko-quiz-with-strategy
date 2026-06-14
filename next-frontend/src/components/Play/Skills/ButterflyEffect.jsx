"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ButterflyEffect({ isActive }) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ x: -100, y: 100, opacity: 0 }}
          animate={{ x: '100vw', y: -200, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="fixed z-50 text-6xl pointer-events-none drop-shadow-lg"
          style={{ bottom: '20%' }}
        >
          🦋
        </motion.div>
      )}
    </AnimatePresence>
  );
}
