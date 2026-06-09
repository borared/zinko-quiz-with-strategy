"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
;
import { motion } from 'framer-motion';
import WarmUpHeader from './WarmUpHeader';
import TeamPanel from './TeamPanel';
import VsCard from './VsCard';
import BlinkingEye from './BlinkingEye';
import WaitingBar from '../TeamSelect/WaitingBar';

const bounceIn = (delay = 0) => ({
  initial: { scale: 0, opacity: 0, y: 50 },
  animate: { scale: 1, opacity: 1, y: 0 },
  transition: { delay, type: 'spring', stiffness: 380, damping: 18, mass: 0.9 },
});

const backgrounds = [
  '/background_battle/forest.jpg',
  '/background_battle/city.jpg',
  '/background_battle/farm.jpg'
];

const TeamWarmUpSection = () => {
  const router = useRouter();
  const [bgImage, setBgImage] = useState(backgrounds[0]);

  useEffect(() => {
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    setBgImage(randomBg);
  }, []);

  return (
    <div 
      className="relative w-full h-screen max-h-screen overflow-hidden bg-zk-yellow flex flex-col items-center justify-center font-sans px-6 py-8 bg-cover bg-center"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Dark overlay for better readability over random backgrounds */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Test Button for ChoosingSkill Navigation */}
      <button 
        onClick={() => router.push('/choose-skill')}
        className="absolute top-4 right-4 z-50 bg-[#5D3FD3] text-white px-4 py-2 rounded-xl font-bold border-2 border-zk-black shadow-[4px_4px_0px_#1a1a1a] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#1a1a1a] transition-all uppercase tracking-widest text-sm"
      >
        Test Choose Skill
      </button>

      {/* Blinking Eye Decorations */}
      <BlinkingEye size={72} x="5%" y="10%" delay={0}   pupilColor="#1a1a1a" />
      <BlinkingEye size={50} x="80%" y="15%" delay={1.2} pupilColor="#5D3FD3" />
      <BlinkingEye size={40} x="88%" y="60%" delay={0.6} pupilColor="#c0392b" />
      <BlinkingEye size={36} x="3%"  y="65%" delay={2}   pupilColor="#2ea84a" />

      {/* Floating golden circle (like the reference image) */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-14 left-16 w-14 h-14 rounded-full bg-[#D4A322]/70 border-[3px] border-zk-black/20 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">

        {/* Header */}
        <motion.div {...bounceIn(0)} className="w-full flex justify-center">
          <WarmUpHeader />
        </motion.div>

        {/* Panels + VS */}
        <div className="flex flex-row items-center justify-center gap-4 w-full mt-2">
          <motion.div {...bounceIn(0.1)} className="flex-1">
            <TeamPanel teamName="Team A" playerCount={4} color="green" />
          </motion.div>

          <motion.div {...bounceIn(0.2)}>
            <VsCard />
          </motion.div>

          <motion.div {...bounceIn(0.1)} className="flex-1">
            <TeamPanel teamName="Team B" playerCount={4} color="red" />
          </motion.div>

        </div>

        
      </div>

      
          {/* Waiting bar slides up from the bottom */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute bottom-0 left-0 w-full"
      >
        <WaitingBar />
      </motion.div>
    </div>
  );
};

export default TeamWarmUpSection;
