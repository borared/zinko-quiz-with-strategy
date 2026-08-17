import React from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { 
    id: "Tech & Science", 
    subtitle: "Code & Cosmos",
    number: "1",
    baseColor: "bg-[#8E44AD]", // Purple border base
    titleColor: "text-white",
    subtitleColor: "text-[#3498DB]", // Cyan
    bullets: ["Programming & AI", "Robotics & Space", "Physics & Quantum"],
    bgImage: "/images/hangman/hangman_tech.jpg",
    rotate: "-9",
    yOffset: "translate-y-2"
  },
  { 
    id: "Geography & History", 
    subtitle: "Maps & Timelines",
    number: "2",
    baseColor: "bg-[#EAE6DF]", // Beige border base
    titleColor: "text-black",
    subtitleColor: "text-[#27AE60]", // Green
    bullets: ["Ancient History", "World Geography", "Great Empires"],
    bgImage: "/images/hangman/hangman_geography.png",
    rotate: "-3",
    yOffset: "translate-y-0"
  },
  { 
    id: "Arts & Culture", 
    subtitle: "Canvas & Chords",
    number: "3",
    baseColor: "bg-[#8E44AD]", // Purple border base
    titleColor: "text-white",
    subtitleColor: "text-[#9B59B6]", // Purple/Magenta
    bullets: ["Classic Painting", "Music & Theatre", "World Cultures"],
    bgImage: "/images/hangman/hangman_art.jpg",
    rotate: "3",
    yOffset: "translate-y-0"
  },
  { 
    id: "General & Fun", 
    subtitle: "Dice & Trivia",
    number: "4",
    baseColor: "bg-[#EAE6DF]", // Beige border base
    titleColor: "text-black",
    subtitleColor: "text-[#E74C3C]", // Red/Orange
    bullets: ["Pop Culture Trivia", "Logic & Word Games", "Fun Facts & Riddles"],
    bgImage: "/images/hangman/hangman_general.png",
    rotate: "9",
    yOffset: "translate-y-2"
  }
];

export default function HangmanCategoryPicker({ onSelectCategory }) {
  return (
    <div className="absolute inset-0 flex flex-col p-6 md:p-10 z-20 overflow-hidden justify-between bg-black/80 backdrop-blur-[2px] h-screen max-h-screen">
      {/* Header section with Gold gradient title */}
      <div className="text-center mb-4 relative z-10 mt-2">
        <h1 className="gasoek-one-regular text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#FDE08B] via-yellow-400 to-[#F1C40F] tracking-widest mb-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
          Hangman Battle
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-bold uppercase tracking-[6px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          Choose a Category
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mt-3 opacity-70" />
      </div>

      {/* Horizontal Fanned Perspective Card Layout */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex items-center justify-center py-4 min-h-0">
        <div className="flex items-center justify-start md:justify-center gap-x-2 md:gap-x-3 lg:gap-x-4 w-full py-8 overflow-x-auto scrollbar-none snap-x snap-mandatory px-12 md:px-0 h-full">
          {CATEGORIES.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ 
                opacity: 0, 
                x: 50, 
                y: 30, 
                rotate: parseFloat(cat.rotate) 
              }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                y: 0, 
                rotate: parseFloat(cat.rotate) 
              }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.08, 
                y: -24, 
                rotate: 0, // Straighten card on hover
                zIndex: 100,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative w-44 sm:w-52 md:w-60 h-[19rem] sm:h-[22rem] md:h-[26rem] lg:h-[28rem] rounded-2xl md:rounded-[1.5rem] p-3 flex flex-col items-stretch justify-start ${cat.baseColor} ${cat.yOffset} transition-all duration-300 shadow-2xl shrink-0 -mx-2 sm:-mx-3 md:-mx-4 lg:-mx-5 snap-center`}
              style={{ perspective: 1000 }}
            >
              {/* Top border row: Badge & Title */}
              <div className="flex items-center z-10 w-full px-1">
                {/* Outlined badge number */}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white border-[3px] border-black text-black flex items-center justify-center font-black text-base md:text-xl shrink-0 shadow-sm">
                  {cat.number}
                </div>
                {/* Category Title */}
                <span className={`text-left font-black tracking-wide leading-tight text-xs sm:text-sm md:text-base ml-2 w-full truncate ${cat.titleColor}`}>
                  {cat.id}
                </span>
              </div>

              {/* Inner Matte Black content panel */}
              <div className="flex-1 bg-[#111111] rounded-xl p-3 md:p-4 flex flex-col justify-between mt-2.5 relative overflow-hidden z-10">
                
                {/* Top of panel: Colored Mac-style Window dots */}
                <div className="flex gap-1 justify-end opacity-60">
                  <div className={`w-1.5 h-1.5 rounded-full ${cat.baseColor === 'bg-[#EAE6DF]' ? 'bg-[#EAE6DF]' : 'bg-[#8E44AD]'}`} />
                  <div className={`w-1.5 h-1.5 rounded-full ${cat.baseColor === 'bg-[#EAE6DF]' ? 'bg-[#EAE6DF]' : 'bg-[#8E44AD]'}`} />
                  <div className={`w-1.5 h-1.5 rounded-full ${cat.baseColor === 'bg-[#EAE6DF]' ? 'bg-[#EAE6DF]' : 'bg-[#8E44AD]'}`} />
                </div>

                {/* Cover Image banner */}
                <div className="w-full h-28 sm:h-36 md:h-40 lg:h-44 rounded-lg overflow-hidden relative border border-white/10 mt-1 shrink-0">
                  <img src={cat.bgImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                </div>

                {/* Card Subtitle */}
                <span className={`text-left font-black tracking-wide text-xs sm:text-sm md:text-base mt-2 truncate w-full ${cat.subtitleColor}`}>
                  {cat.subtitle}
                </span>

                {/* Sub-items list (bullets) */}
                <ul className="flex flex-col items-start gap-1 w-full mt-1.5">
                  {cat.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-white/70 text-[9px] sm:text-[10px] md:text-xs font-semibold text-left w-full truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.subtitleColor}`} />
                      {bullet}
                    </li>
                  ))}
                </ul>

                {/* Select indicator button pill at bottom right */}
                <div className="w-full flex justify-end mt-2">
                  <div className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-1 text-white shrink-0">
                    Select
                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>

              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer spacer */}
      <div className="h-4 relative z-10" />
    </div>
  );
}
