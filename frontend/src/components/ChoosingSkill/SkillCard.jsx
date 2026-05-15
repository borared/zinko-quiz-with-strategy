import React from "react";
import { motion } from "framer-motion";

const SkillCard = ({
  name,
  imageUrl,
  skillDescription,
  isSelected,
  isLocked,
  onClick,
  onCancel,
  initial,
  animate,
  transition
}) => {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className={`group relative flex-1 h-full overflow-hidden transition-all duration-300 ease-in-out border-r-2 border-black/50 last:border-r-0 bg-zk-black 
        ${isSelected ? "z-10 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex-[1.1] cursor-default" 
        : isLocked ? "opacity-50 grayscale-[50%] cursor-not-allowed" 
        : "cursor-pointer hover:flex-[1.05] hover:z-10"}`}
      onClick={isLocked ? undefined : onClick}
    >
      {/* Background Image */}
      <motion.img
        src={imageUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500"
        whileHover={isLocked || isSelected ? {} : { scale: 1.05 }}
      />

      {/* Overlay gradient for text readability (appears on hover or when selected) */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${isSelected ? "opacity-100" : isLocked ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}
      />

      {/* Skill Info */}
      <div
        className={`absolute bottom-0 left-0 w-full p-6 text-center transition-transform duration-300 flex flex-col items-center justify-end h-full ${isSelected ? "translate-y-0 opacity-100" : isLocked ? "translate-y-8 opacity-0" : "translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"}`}
      >
        <h3
          className="text-3xl font-black text-white uppercase tracking-widest mb-3 permanent-marker-regular"
          style={{
            WebkitTextStroke: "1px #1a1a1a",
            textShadow: "2px 2px 0 #1a1a1a",
          }}
        >
          {name}
        </h3>
        <p className="text-white font-black bg-zk-blue p-3 md:p-4 rounded-xl border-[3px] border-[#1a1a1a] text-sm md:text-base leading-snug max-w-[90%] shadow-[4px_4px_0px_#1a1a1a] md:shadow-[6px_6px_0px_#1a1a1a] tracking-wide">
          {skillDescription}
        </p>
      </div>

      {/* Selection Border */}
      {isSelected && (
        <div className="absolute inset-0 border-4 border-[#D4A322] pointer-events-none" />
      )}

      {/* Static Cancel Button inside the Card */}
      {isSelected && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-50 bg-[#FF4B4B] text-white font-black px-3 py-2 border-[3px] border-zk-black rounded-lg shadow-[4px_4px_0px_#1a1a1a] hover:shadow-[2px_2px_0px_#1a1a1a] hover:translate-y-[2px] hover:translate-x-[2px] transition-all uppercase tracking-widest text-xs flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Cancel
        </button>
      )}
    </motion.div>
  );
};

export default SkillCard;
