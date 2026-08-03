import React from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: "Tech & Science", color: "bg-[#3b82f6]", icon: "💻" },
  { id: "Geography & History", color: "bg-[#22c55e]", icon: "🌍" },
  { id: "Arts & Culture", color: "bg-[#a855f7]", icon: "🎨" },
  { id: "General & Fun", color: "bg-[#f59e0b]", icon: "🎲" }
];

export default function HangmanCategoryPicker({ onSelectCategory }) {
  return (
    <div className="absolute inset-0 flex flex-col p-8 z-20 overflow-y-auto">
      <div className="text-center mb-12 relative z-10 mt-8">
        <h1 className="gasoek-one-regular text-7xl text-zk-yellow uppercase tracking-widest drop-shadow-[0_6px_0_#000] stroke-black stroke-2 mb-4" style={{ WebkitTextStroke: '3px black' }}>
          HANGMAN BATTLE
        </h1>
        <p className="text-5xl text-white font-bold drop-shadow-[0_4px_0_#000]" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '4px' }}>
          Choose a Category!
        </p>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {CATEGORIES.map((cat, index) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(cat.id)}
            className={`${cat.color} border-[6px] border-black rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#000] transition-shadow`}
          >
            <span className="text-6xl drop-shadow-md">{cat.icon}</span>
            <span className="text-4xl font-black text-white uppercase tracking-wider text-center drop-shadow-md" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>
              {cat.id}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
