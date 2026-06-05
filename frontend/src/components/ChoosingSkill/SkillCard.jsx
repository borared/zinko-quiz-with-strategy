import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SkillCard = ({
  name,
  icon: Icon,
  color,
  skillDescription,
  isSelected,
  isLocked,
  locker,
  onClick,
  onCancel,
  index,
  initial,
  animate,
  transition
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Auto flip after a short delay so they start face down and then flip
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 500 + index * 200);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className="w-full h-32 lg:h-full lg:flex-1 perspective-1000 flex-shrink-0"
    >
      <motion.div
        className={`w-full h-full relative preserve-3d transition-all duration-300 ${isSelected ? 'scale-[1.02] z-10' : 'hover:scale-[1.01]'}`}
        animate={{ rotateY: isFlipped ? 0 : 180 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
        onClick={isLocked ? undefined : onClick}
      >
        {/* FRONT */}
        <div 
          className={`absolute inset-0 backface-hidden flex lg:flex-col items-center justify-center p-4 lg:p-6 border-[4px] border-black rounded-xl shadow-[6px_6px_0_rgba(0,0,0,1)] cursor-pointer bg-[#1a1a1a]
            ${isLocked && !locker ? 'opacity-50 grayscale' : ''} ${isSelected ? 'border-[#FFCD29] shadow-[0_0_20px_#FFCD29]' : ''} ${locker ? 'border-zk-blue shadow-[0_0_20px_var(--zk-blue)]' : ''}`}
        >
           <div className="w-20 h-20 lg:w-32 lg:h-32 flex-shrink-0 border-[3px] border-black rounded-xl flex items-center justify-center mr-4 lg:mr-0 lg:mb-6" style={{ backgroundColor: color }}>
              {Icon && <Icon className="w-10 h-10 lg:w-16 lg:h-16 text-white" strokeWidth={3} />}
           </div>
           
           <div className="flex-1 lg:flex-none flex flex-col justify-center text-left lg:text-center w-full">
              <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-widest zinko-font" style={{ WebkitTextStroke: '1px #000' }}>{name}</h3>
              <p className="text-white font-bold text-sm lg:text-base bg-black/40 px-3 py-1 rounded inline-block mt-1 lg:mt-3 border-[2px] border-black mx-auto">
                 {skillDescription}
              </p>
           </div>

           {isSelected && (
              <button
                onClick={(e) => { e.stopPropagation(); onCancel(e); }}
                className="bg-[#FF4B4B] text-white font-black px-3 py-2 lg:px-6 lg:py-3 lg:mt-6 border-[3px] border-black rounded-lg shadow-[4px_4px_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_#000] transition-all uppercase tracking-widest text-xs lg:text-sm ml-2 lg:ml-0 flex-shrink-0"
              >
                Cancel
              </button>
           )}

           <AnimatePresence>
             {locker && (
               <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0 }}
                 className="absolute -top-3 -right-3 lg:-top-5 lg:-right-5 bg-zk-blue border-[3px] border-black rounded-xl p-2 lg:p-3 shadow-[4px_4px_0_#000] flex flex-col items-center z-20"
               >
                 <img src={locker.avatar} alt={locker.nickname} className="w-8 h-8 lg:w-12 lg:h-12 object-cover rounded-lg" />
                 <span className="text-white font-black text-[10px] lg:text-xs uppercase bg-black/50 px-1 rounded mt-1 max-w-[60px] lg:max-w-[80px] truncate text-center">
                   {locker.nickname}
                 </span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 backface-hidden flex items-center justify-center border-[4px] border-black rounded-xl shadow-[6px_6px_0_rgba(0,0,0,1)] bg-[#FFCD29] overflow-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="absolute inset-0 opacity-20"
               style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #FFCD29 25%, #FFCD29 75%, #000 75%, #000)", backgroundPosition: "0 0, 10px 10px", backgroundSize: "20px 20px" }} />
          <div className="bg-white border-[4px] border-black px-6 py-2 rounded-xl transform -rotate-6 z-10 shadow-[4px_4px_0_#000]">
             <span className="font-black text-black text-3xl lg:text-5xl uppercase tracking-widest zinko-font">Zinko</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SkillCard;
