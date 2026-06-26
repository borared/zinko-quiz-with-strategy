"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const AvatarSelector = ({ avatars, selectedAvatar, onSelect, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-[4px] border-zk-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-2xl w-full max-w-[450px] max-h-[80vh] flex flex-col overflow-hidden"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-[3px] border-zk-black">
          <h3 className="text-xl font-black italic text-zk-black uppercase tracking-tight permanent-marker-regular">
            Pick Your Character
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors border-[2px] border-transparent hover:border-zk-black"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Grid */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 w-full">
{avatars.map((avatar) => {
               const isSelected = selectedAvatar && selectedAvatar.id === avatar.id;
               
               return (
                 <motion.div
                   key={avatar.id}
                   onClick={() => onSelect(avatar)}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   className={`relative cursor-pointer aspect-square rounded-xl border-[3px] flex items-center justify-center overflow-hidden transition-colors ${
                     isSelected 
                       ? 'border-zk-black bg-[#FFCD29] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                       : 'border-zk-black/10 bg-white hover:border-zk-black/30'
                   }`}
                 >
                   <img 
                     src={avatar.image_url} 
                     alt="Avatar option" 
                     loading="eager"
                     className="w-[90%] h-[90%] object-cover drop-shadow-md rounded-lg"
                   />
                  
                  {isSelected && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-2 right-2 bg-white rounded-full p-0.5 border-[2px] border-zk-black shadow-sm"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default AvatarSelector;
