"use client";
import React from 'react';
import HeroSection from '../../components/landingSection/HeroSection';

const Hero = () => {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center pb-24 md:pb-32">
      {/* Hardware-accelerated fixed background */}
      <div className="fixed inset-0 z-[-1] bg-black pointer-events-none transform-gpu">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60" 
          style={{ backgroundImage: `url('/images/hero_bg.png')` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_80%,rgba(0,0,0,1)_100%)]" />
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 w-full">
        <HeroSection />
      </main>
    </div>
  );
};

export default Hero;
