"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();

  return (
    <main className="flex-1 relative flex flex-col items-center justify-center py-20 px-4 overflow-hidden">

      {/* Floating Shapes */}
      <motion.div
        animate={{ y: [-15, 15, -15], rotate: 360 }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 10, repeat: Infinity, ease: "linear" }
        }}
        className="absolute top-[10%] left-[10%] w-20 h-20 bg-zk-blue border-[4px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl"
      />
      <motion.div
        animate={{ y: [15, -15, 15], rotate: -360 }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 12, repeat: Infinity, ease: "linear" }
        }}
        className="absolute top-[5%] right-[15%] w-16 h-16 bg-[#6E5CF2] border-[4px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl"
      />
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] left-[10%] w-12 h-12 bg-[#FF6B6B] border-[4px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full"
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[5%] right-[15%] w-24 h-24 bg-[#FDE08B] border-[4px] border-zk-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl"
      />

      {/* Main Text */}
      <div className="relative z-10 text-center flex flex-col items-center gap-4">
        <h1
          className="text-4xl md:text-7xl font-black text-zk-white tracking-wide gasoek-one-regular"
          style={{
            textShadow: '4px 4px 0px var(--zk-blue), 6px 6px 0px var(--zk-blue), 8px 8px 0px var(--zk-blue)',
            WebkitTextStroke: '2px var(--zk-blue)'
          }}
        >
          Master the Game.<br />
          Control the Outcome.
        </h1>

        {/* Description Box */}
        <div className="mt-8 border-[2px] border-transparent px-8 py-4 rounded-lg max-w-3xl">
          <p
            className="text-zk-black text-3xl md:text-5xl font-bold"
            style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
          >
            Empower your classroom with interactive quizzes that feel like real games. No<br className="hidden md:block" />
            toxic, no hassle just pure fun.
          </p>
        </div>

        {/* Bottom Section: Characters & Button */}
        <div className="mt-2 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-5xl">

          {/* Character 1 */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 md:w-64"
          >
            <img
              src="https://res.cloudinary.com/dicrvjstp/image/upload/v1777969164/Screenshot_2026-05-05_133201_c3kyvs.png"
              alt="Candy Corn Character"
              className="w-full h-auto object-contain rounded-xl"
            />
          </motion.div>

          {/* Button */}
          <button
            onClick={() => router.push('/join')}
            className="bg-zk-blue text-zk-white border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-10 py-5 flex items-center gap-3 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[8px] active:translate-x-[8px] active:shadow-none rounded-xl"
          >
            <span className="font-bold text-4xl tracking-wide"
              style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>JOIN</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10 8 16 12 10 16 10 8"></polygon>
            </svg>
          </button>

          {/* Character 2 */}
          <motion.div
            animate={{ y: [8, -8, 8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-48 md:w-64"
          >
            <img
              src="https://res.cloudinary.com/dicrvjstp/image/upload/v1777969164/Screenshot_2026-05-05_133406_nh0a38.png"
              alt="Lightning Character"
              className="w-full h-auto object-contain rounded-xl"
            />
          </motion.div>

        </div>

      </div>
    </main>
  );
};

export default HeroSection;
