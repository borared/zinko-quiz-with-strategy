import React from 'react';
import { motion } from 'framer-motion';

const AVATAR_OPTIONS = [
  { id: 'pizza', src: '/avatars/pizza.png', label: 'Pizza' },
  { id: 'donut', src: '/avatars/donut.png', label: 'Donut' },
  { id: 'fox', src: '/avatars/fox.png', label: 'Fox' },
  { id: 'frog', src: '/avatars/frog.png', label: 'Frog' },
];

const AvatarSelector = ({ selectedAvatar, onSelect }) => {
  return (
    <div className="w-full mb-6 flex flex-col items-center">
      <label className="block text-xs font-black text-zk-black uppercase tracking-wider mb-3">
        Pick Your Character
      </label>
      
      <div className="grid grid-cols-4 gap-2 md:gap-4 w-full">
        {AVATAR_OPTIONS.map((avatar) => {
          const isSelected = selectedAvatar === avatar.id;
          
          return (
            <motion.div
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative cursor-pointer aspect-square rounded-xl border-[3px] flex items-center justify-center overflow-hidden transition-colors ${
                isSelected 
                  ? 'border-zk-black bg-[#FFCD29] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                  : 'border-transparent bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <img 
                src={`${avatar.src}?v=2`} 
                alt={avatar.label} 
                className="w-[80%] h-[80%] object-contain drop-shadow-md"
              />
              
              {isSelected && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 border-2 border-zk-black"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarSelector;
