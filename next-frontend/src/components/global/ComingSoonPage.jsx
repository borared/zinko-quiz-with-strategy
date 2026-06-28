"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function ComingSoonPage({ featureName, description }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zk-yellow flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <motion.div
        animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-20 w-32 h-32 bg-[#FF4B4B] border-[4px] border-zk-black rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] opacity-80 pointer-events-none hidden md:block"
      />
      <motion.div
        animate={{ y: [20, -20, 20], rotate: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 right-20 w-40 h-40 bg-[#5D3FD3] border-[4px] border-zk-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] opacity-80 pointer-events-none hidden md:block"
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
        <motion.div
          animate={{ y: [-15, 15, -15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <h1
            className="text-[100px] md:text-[180px] text-white leading-none mb-4"
            style={{
              WebkitTextStroke: '8px #1E1E1E',
              textShadow: '16px 16px 0px #1E1E1E',
              fontFamily: "'Gasoek One', sans-serif",
            }}
          >
            SOON
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2
            className="text-4xl md:text-6xl font-black text-zk-black uppercase mb-4 tracking-tighter"
            style={{ fontFamily: 'var(--font-permanent-marker), cursive' }}
          >
            {featureName} Coming Soon!
          </h2>
          <p className="text-xl md:text-2xl font-bold text-zk-black/80 mb-12">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 bg-white text-zk-black border-[3px] border-zk-black px-8 py-3 rounded-xl uppercase transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '2px' }}
            >
              <ArrowLeft size={32} strokeWidth={3} className="mt-1" />
              Go Back
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 bg-[#00C853] text-white border-[3px] border-zk-black px-8 py-3 rounded-xl uppercase transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '2px' }}
            >
              <Home size={32} strokeWidth={3} className="mt-1" />
              Home Base
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}