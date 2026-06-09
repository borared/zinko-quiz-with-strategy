"use client";
import { motion, AnimatePresence } from 'framer-motion';

export default function RabbitRush({ isActive }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 ring-[16px] ring-[#F39C12] ring-inset z-50 pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
