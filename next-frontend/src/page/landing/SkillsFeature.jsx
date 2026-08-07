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
    <section className="bg-zk-panel-bg py-24 px-4 font-sans border-y-[4px] border-zk-border">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left: Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-zk-panel-bg border-[4px] border-zk-border mb-8">
            <Zap size={24} className="text-zk-text" strokeWidth={3} />
            <span className="text-xl gasoek-one-regular text-zk-text tracking-wider">Dynamic Gameplay</span>
          </div>
          
          <h2 className="gasoek-one-regular text-4xl md:text-6xl text-zk-text mb-8 leading-tight">
            Not just quizzes.<br/>It's Strategy.
          </h2>
          
          <p className="text-zk-text text-lg md:text-xl mb-10 max-w-lg font-medium leading-relaxed">
            Turn the tide of battle! In Zinko Quiz, you can activate powerful skills every round. Sabotage your opponents or boost your own score to claim victory.
          </p>

          <button 
            onClick={() => router.push('/skills')}
            className="bg-zk-blue text-zk-white border-[4px] border-zk-border px-6 py-3 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 rounded-xl"
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
                  className={`border-[4px] border-zk-border rounded-2xl p-6 flex flex-col items-start transition-transform`}
                  style={{ backgroundColor: skill.color }}
                >
                  <div className="mb-4">
                    <Icon size={32} className={textColorClass} strokeWidth={2.5} />
                  </div>
                  <h3 className={`${textColorClass} text-xl mb-3 gasoek-one-regular tracking-wide uppercase`}>
                    {skill.name}
                  </h3>
                  <p className={`${textColorClass} font-semibold text-sm md:text-base leading-relaxed`}>
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
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}
