"use client";
"use client";
import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();

  return (
    <section className="w-full">
      <div className="relative w-full max-w-[90rem] mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* Left Side: Lottie Animation */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative z-10">
          <div className="w-full max-w-[400px] aspect-square transform hover:scale-105 transition-transform duration-500 ease-out">
            <DotLottieReact
              src="https://lottie.host/24ab9b71-ff1d-40c1-8732-36339ad9dd0f/UypikKSNSE.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        {/* Right Side: Text Content */}
        <div className="w-full lg:w-1/2 relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start lg:mt-12">
          <h2 className="text-4xl md:text-[54px] lg:text-[66px] font-black tracking-wide gasoek-one-regular leading-tight mb-6">
            <span 
              className="text-zk-white block"
              style={{
                textShadow: '4px 4px 0px var(--zk-blue), 6px 6px 0px var(--zk-blue), 8px 8px 0px var(--zk-blue)',
                WebkitTextStroke: '2px var(--zk-blue)'
              }}
            >
              Master the Game.
            </span>
            <span 
              className="text-zk-yellow block"
              style={{
                textShadow: '4px 4px 0px var(--zk-blue), 6px 6px 0px var(--zk-blue), 8px 8px 0px var(--zk-blue)',
                WebkitTextStroke: '2px var(--zk-blue)'
              }}
            >
              Control the Outcome.
            </span>
          </h2>
          
          <p className="text-white text-xl md:text-2xl font-normal font-['Outfit'] max-w-xl mb-6 leading-relaxed">
            Empower your classroom with interactive quizzes that feel like real games. No topic limits, no hassle just pure fun.
          </p>
          
          {/* CTA Button */}
          <div className="flex justify-center lg:justify-start mt-2">
            <button
              type="button"
              onClick={() => router.push('/join')}
              className="bg-zk-blue text-zk-white border-[3px] border-zk-border shadow-[4px_4px_0px_0px_#1e3a8a] px-8 py-3 flex items-center gap-3 transition-shadow hover:shadow-[6px_6px_0px_0px_#1e3a8a] rounded-xl hover:-translate-y-1 active:translate-y-1"
            >
              <span className="font-bold text-3xl tracking-wide" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>JOIN</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
