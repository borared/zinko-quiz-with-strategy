"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SKILLS } from '@/config/skills';

export default function SkillsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zk-yellow text-zk-black font-sans selection:bg-zk-black selection:text-zk-white pb-24">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 bg-zk-yellow border-b-[4px] border-zk-black flex items-center shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 bg-zk-white border-[3px] border-zk-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-4 py-2 rounded-xl font-bold hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all text-xl"
          style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '1px' }}
        >
          <ArrowLeftIcon />
          BACK TO HOME
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center"
        >
          <h1 
            className="gasoek-one-regular text-5xl md:text-7xl mb-6 text-zk-white tracking-widest drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
            style={{ WebkitTextStroke: '3px black' }}
          >
            MASTER THE ELEMENTS
          </h1>
          
          <div className="bg-zk-white border-[4px] border-zk-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-8 py-4 rounded-xl max-w-2xl">
            <p className="text-3xl md:text-4xl text-zk-black font-bold" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>
              Discover the powerful skills that will turn the tide of every round. Timing is everything.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Skills Showcase */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col gap-12 md:gap-20">
          {SKILLS.map((skill, index) => {
            const Icon = skill.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div 
                key={skill.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}
              >
                {/* Visual Representation */}
                <div className="flex-1 w-full flex justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: isEven ? 5 : -5 }}
                    className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl border-[6px] border-zk-black flex items-center justify-center bg-zk-white shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
                  >
                    <div 
                      className="absolute inset-4 rounded-2xl border-[4px] border-zk-black border-dashed opacity-30"
                      style={{ borderColor: skill.color }}
                    />
                    
                    <div
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border-[5px] border-zk-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
                      style={{ backgroundColor: skill.color }}
                    >
                      <Icon size={72} className="text-zk-white drop-shadow-[3px_3px_0_rgba(0,0,0,1)]" strokeWidth={3} />
                    </div>
                  </motion.div>
                </div>

                {/* Text Content */}
                <div className="flex-1 flex flex-col justify-center text-center md:text-left items-center md:items-start">
                  <h2 
                    className="gasoek-one-regular text-5xl md:text-6xl mb-6 text-zk-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]"
                    style={{ WebkitTextStroke: '2px black' }}
                  >
                    {skill.name}
                  </h2>
                  
                  <div 
                    className="inline-block px-6 py-3 rounded-xl border-[4px] border-zk-black font-black text-2xl mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-zk-white"
                    style={{ backgroundColor: skill.color, fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
                  >
                    {skill.skillDescription}
                  </div>
                  
                  <div className="bg-zk-white border-[4px] border-zk-black p-6 rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                    <p className="text-zk-black text-2xl font-bold leading-relaxed" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '1px' }}>
                      Strategic use of {skill.name} can completely change the dynamic of the game. Wait for the perfect moment to deploy this ability and leave your opponents scrambling to catch up.
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
      
      {/* Footer Call to Action */}
      <section className="mt-32 text-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex flex-col items-center p-12 rounded-3xl bg-[#9B59B6] border-[6px] border-zk-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
        >
          <h2 className="gasoek-one-regular text-4xl md:text-5xl text-zk-white mb-8 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" style={{ WebkitTextStroke: '2px black' }}>
            READY TO TEST YOUR STRATEGY?
          </h2>
          <button 
            onClick={() => router.push('/')}
            className="bg-zk-yellow text-zk-black border-[4px] border-zk-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] px-12 py-6 rounded-2xl font-black text-4xl uppercase hover:translate-y-[4px] hover:translate-x-[4px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-[8px] active:translate-x-[8px] active:shadow-none transition-all"
            style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '3px' }}
          >
            Play Now
          </button>
        </motion.div>
      </section>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );
}
