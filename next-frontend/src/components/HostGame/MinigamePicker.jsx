import React from 'react';
import { motion } from 'framer-motion';

export default function MinigamePicker({ onPick }) {
  return (
    <div className="min-h-screen flex flex-col font-sans text-white relative p-8 items-center justify-center w-full z-10">
      
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-black tracking-widest mb-12">Choose Next Minigame</h1>
        
        <div className="flex flex-col sm:flex-row gap-8 max-w-5xl w-full justify-center items-stretch">
          
          {/* Option 1: Draw It */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => onPick('DRAW_IT')}
            className="group flex flex-col p-4 bg-zk-panel-bg rounded-lg w-full sm:w-96 overflow-hidden items-center justify-between"
          >
            <div className="w-full aspect-video bg-gray-200 rounded mb-4 overflow-hidden">
              <img 
                src="/images/pickMiniGame/fiveGridWord.png" 
                alt="Draw It" 
                className="w-full h-full object-cover" 
              />
            </div>
            <h2 className="text-3xl font-black text-white">Draw It</h2>
            <p className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-wide">Drawing Challenge</p>
          </motion.button>
          
          {/* Option 2: Guess the Imposter */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => onPick('IMPOSTER')}
            className="group flex flex-col p-4 bg-zk-panel-bg rounded-lg w-full sm:w-96 overflow-hidden items-center justify-between"
          >
            <div className="w-full aspect-video bg-gray-200 rounded mb-4 overflow-hidden">
              <img 
                src="/images/pickMiniGame/guessImposter.png" 
                alt="Guess the Imposter" 
                className="w-full h-full object-cover" 
              />
            </div>
            <h2 className="text-3xl font-black text-white">Guess the Imposter</h2>
            <p className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-wide">Social Deduction</p>
          </motion.button>

        </div>
      </div>
    </div>
  );
}
