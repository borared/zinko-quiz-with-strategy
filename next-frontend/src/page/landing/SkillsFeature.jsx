"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap, Cloud, Eye, Target, Gamepad2 } from 'lucide-react';

const skills = [
  {
    id: "rabbit",
    name: "Mento",
    icon: Zap,
    color: "#F39C12",
    description: "Double your points for 5 seconds.",
    image: "/images/skills/rabbit.png",
    delay: 0
  },
  {
    id: "fox",
    name: "Kage",
    icon: Cloud,
    color: "#E74C3C",
    description: "Blind enemies with a smokescreen.",
    image: "/images/skills/fox.png",
    delay: 0.2
  },
  {
    id: "butterfly",
    name: "Lumina",
    icon: Eye,
    color: "#9B59B6",
    description: "Remove 2 wrong answers instantly.",
    image: "/images/skills/butterfly.png",
    delay: 0.4
  },
  {
    id: "frog",
    name: "Glitch",
    icon: Target,
    color: "#27AE60",
    description: "Steal 50% of an enemy's points.",
    image: "/images/skills/frog.png",
    delay: 0.6
  }
];

export default function SkillsFeature() {
  const router = useRouter();

  return (
    <section className="bg-zk-panel-bg py-24 px-4 font-sans border-b-2 border-zk-border">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left: Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <Gamepad2 size={28} className="text-[#FFCD29]" strokeWidth={2.5} />
            <span className="text-xl md:text-2xl font-['Outfit'] font-black text-[#FFCD29] tracking-widest">Dynamic Gameplay</span>
          </div>
          
          <h2 className="gasoek-one-regular text-4xl md:text-6xl text-zk-text mb-8 leading-tight">
            Not just quizzes.<br/>It's Strategy.
          </h2>
          
          <p className="text-zk-text text-lg md:text-xl mb-10 max-w-lg font-['Outfit'] font-medium leading-relaxed">
            Turn the tide of battle! In Zinko Quiz, you can activate powerful skills every round. Sabotage your opponents or boost your own score to claim victory.
          </p>

          <button 
            onClick={() => router.push('/skills')}
            className="bg-zk-blue text-zk-white border-2 border-zk-border px-6 py-3 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 rounded-xl"
          >
            <span 
              className="font-bold text-2xl md:text-3xl tracking-wide" 
              style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
            >
              Discover All Skills
            </span>
            <ArrowIcon />
          </button>
        </motion.div>

        {/* Right: Skills Grid Showcase */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ willChange: 'transform' }}
          className="flex-1 w-full max-w-lg"
        >
          <div className="grid grid-cols-2 gap-6">
            {skills.map((skill, index) => {
              return (
                <motion.div 
                  key={skill.id}
                  initial={{ y: 0 }}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3 + (index * 0.2), 
                    ease: "easeInOut",
                    delay: skill.delay 
                  }}
                  whileHover={{ scale: 1.05, rotateZ: index % 2 === 0 ? -3 : 3 }}
                  className="relative w-full aspect-[3/4] border-[6px] border-zk-border rounded-[2rem] overflow-hidden flex flex-col justify-end transition-all cursor-pointer"
                  style={{ 
                    boxShadow: '4px 4px 0px 0px var(--zk-border)',
                    backgroundColor: skill.color,
                    willChange: 'transform',
                    transform: 'translateZ(0)'
                  }}
                >
                  {/* Full Background Image */}
                  <img src={skill.image} alt={skill.name} className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-normal" />
                  
                  {/* Inner thin border overlay */}
                  <div className="absolute inset-3 border-[3px] border-white/40 rounded-2xl z-10 pointer-events-none"></div>

                  {/* Content area at bottom */}
                  <div className="relative z-20 w-full p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16">
                    <h3 className={`text-white text-2xl md:text-3xl mb-1 gasoek-one-regular tracking-wide leading-tight`} style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.8)' }}>
                      {skill.name}
                    </h3>
                    <p className={`text-white/90 font-['Outfit'] font-bold text-sm md:text-base leading-snug`} style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.8)' }}>
                      {skill.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}
