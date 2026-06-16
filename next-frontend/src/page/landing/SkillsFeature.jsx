"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap, Cloud, Eye, Target } from 'lucide-react';

const skills = [
  {
    id: "rabbit",
    name: "The Rabbit",
    icon: Zap,
    color: "#F39C12",
    description: "Double your points for 5 seconds."
  },
  {
    id: "fox",
    name: "The Fox",
    icon: Cloud,
    color: "#E74C3C",
    description: "Blind enemies with a smokescreen."
  },
  {
    id: "butterfly",
    name: "The Butterfly",
    icon: Eye,
    color: "#9B59B6",
    description: "Remove 2 wrong answers instantly."
  },
  {
    id: "frog",
    name: "The Frog",
    icon: Target,
    color: "#27AE60",
    description: "Steal 50% of an enemy's points."
  }
];

export default function SkillsFeature() {
  const router = useRouter();

  return (
    <section className="bg-zk-white py-24 px-4 font-sans border-y-[4px] border-zk-black">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left: Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-zk-white border-[4px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
            <Zap size={24} className="text-zk-black" strokeWidth={3} />
            <span className="text-xl gasoek-one-regular text-zk-black uppercase tracking-wider">Dynamic Gameplay</span>
          </div>
          
          <h2 className="gasoek-one-regular text-4xl md:text-6xl text-zk-black mb-8 leading-tight">
            Not just quizzes.<br/>It's Strategy.
          </h2>
          
          <p className="text-zk-black text-2xl md:text-3xl mb-10 max-w-lg font-bold" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '1px' }}>
            Turn the tide of battle! In Zinko Quiz, you can activate powerful skills every round. Sabotage your opponents or boost your own score to claim victory.
          </p>

          <button 
            onClick={() => router.push('/skills')}
            className="bg-zk-blue text-zk-white border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-10 py-5 flex items-center gap-3 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[8px] active:translate-x-[8px] active:shadow-none rounded-xl"
          >
            <span className="font-bold text-3xl tracking-wide uppercase" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>
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
          className="flex-1 w-full max-w-lg"
        >
          <div className="grid grid-cols-2 gap-6">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              // Determine if text should be black or white depending on the color contrast (all current skill colors look good with white text)
              const textColorClass = "text-zk-white";
              
              return (
                <motion.div 
                  key={skill.id}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className={`border-[4px] border-zk-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6 flex flex-col items-start transition-transform`}
                  style={{ backgroundColor: skill.color }}
                >
                  <div className="mb-4">
                    <Icon size={32} className={textColorClass} strokeWidth={2.5} />
                  </div>
                  <h3 className={`${textColorClass} text-xl mb-3 gasoek-one-regular tracking-wide uppercase`}>
                    {skill.name}
                  </h3>
                  <p className={`${textColorClass} font-bold text-xl leading-snug`} style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '1px' }}>
                    {skill.description}
                  </p>
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
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}
