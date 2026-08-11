"use client";
import React from 'react';

const TrustedBy = () => {
  return (
    <section className="w-full bg-black py-12 md:py-16 overflow-hidden relative z-10 border-b border-zk-border/10">
      <div className="max-w-7xl mx-auto px-6 md:px-8 mb-8 md:mb-12 text-center">
        <p className="text-zinc-500 text-xs md:text-sm font-semibold tracking-widest uppercase font-['Outfit']">
          Trusted by
        </p>
      </div>
      
      {/* Marquee Container */}
      <div className="relative w-full flex overflow-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
        
        {/* Marquee Content */}
        <div className="flex w-fit animate-marquee items-center">
          {/* First half */}
          <div className="flex items-center shrink-0 gap-12 md:gap-24 px-6 md:px-12">
            {[...Array(6)].map((_, i) => (
              <img 
                key={`first-${i}`} 
                src="/images/company/Dockified.png" 
                alt="Trusted Companies" 
                className="h-7 md:h-10 w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300 shrink-0" 
              />
            ))}
          </div>
          {/* Second half */}
          <div className="flex items-center shrink-0 gap-12 md:gap-24 px-6 md:px-12">
            {[...Array(6)].map((_, i) => (
              <img 
                key={`second-${i}`} 
                src="/images/company/Dockified.png" 
                alt="Trusted Companies" 
                className="h-7 md:h-10 w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300 shrink-0" 
              />
            ))}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
};

export default TrustedBy;
