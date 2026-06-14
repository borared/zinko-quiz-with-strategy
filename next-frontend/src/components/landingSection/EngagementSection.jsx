"use client";
import React from 'react';
import { Zap, Users, TrendingUp, Palette, CloudDownload } from 'lucide-react';

const EngagementSection = () => {
  return (
    <section className="bg-white py-24 px-4 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col items-center">

        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-black text-zk-black mb-16 text-center gasoek-one-regular tracking-tight">
          Built for Maximum Engagement
        </h2>

        {/* Grid Container */}
        <div className="w-full flex flex-col gap-6">

          {/* Top Row */}
          <div className="flex flex-col md:flex-row gap-6 w-full h-auto md:h-64">

            {/* Quick Start Card */}
            <div className="relative flex-1 md:flex-[0.4] bg-[#FF6B4A] border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 transition-transform rounded-xl">
              <div className="absolute top-6 right-6 bg-white border-[2px] border-zk-black px-3 py-1 font-bold text-sm z-10 rounded-lg">
                QUICK START
              </div>
              <Zap className="text-white w-10 h-10 mb-6" />
              <div className="relative z-10 mt-auto">
                <h3 className="text-white font-bold text-lg mb-2 uppercase">Instant Game Creation</h3>
                <p className="text-white/90 font-medium text-sm md:text-base max-w-[90%]">
                  Turn any list of questions into a competitive classroom experience in under 2 minutes.
                </p>
              </div>
            </div>

            {/* Collaborative Play Card */}
            <div className="relative flex-1 md:flex-[0.6] bg-[#6E5CF2] border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 transition-transform rounded-xl">
              <div className="absolute top-6 right-6 bg-white border-[2px] border-zk-black px-3 py-1 font-bold text-sm z-20 rounded-lg">
                MULTIPLAYER
              </div>

              {/* Added Image for Collaborative Play */}
              <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-90 transition-transform duration-500 group-hover:scale-105 z-0">
                <img
                  src="/collaborative_play.png"
                  alt="Students playing"
                  className="w-full h-full object-cover object-left"
                />
              </div>

              <Users className="text-white w-10 h-10 mb-6 relative z-10" />
              <div className="relative z-10 mt-auto max-w-[60%]">
                <h3 className="text-white font-bold text-lg mb-2 uppercase">Collaborative Play</h3>
                <p className="text-white/90 font-medium text-sm md:text-base">
                  Students can join from any device using a simple Class PIN. No accounts needed for kids!
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row gap-6 w-full h-auto md:h-64">

            {/* Live Analytics Card */}
            <div className="relative flex-1 bg-white border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col overflow-hidden group hover:-translate-y-1 transition-transform rounded-xl">
              <TrendingUp className="text-[#6E5CF2] w-10 h-10 mb-auto" />
              <div className="mt-8">
                <h3 className="text-zk-black font-bold text-lg mb-2 uppercase">Live Analytics</h3>
                <p className="text-zk-black/80 font-medium text-sm md:text-base">
                  Track student progress in real-time as they play through your games.
                </p>
              </div>
            </div>

            {/* Custom Themes Card */}
            <div className="relative flex-1 bg-[#FFD12B] border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col overflow-hidden group hover:-translate-y-1 transition-transform rounded-xl">
              {/* Paintbrush Image */}
              <div className="absolute -right-8 -bottom-4 w-48 h-48 md:w-56 md:h-56 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 z-0">
                <img
                  src="https://res.cloudinary.com/dicrvjstp/image/upload/v1777974595/paint-brush-with-paint-paint-it_1025830-89081_cncmdd.png"
                  alt="Paint Brush"
                  className="w-full h-full object-contain"
                />
              </div>

              <Palette className="text-zk-black w-10 h-10 mb-auto relative z-10" />
              <div className="relative z-10 mt-8 max-w-[80%]">
                <h3 className="text-zk-black font-bold text-lg mb-2 uppercase">Custom Themes</h3>
                <p className="text-zk-black/80 font-medium text-sm md:text-base">
                  Pick from dozens of high-energy visual styles to match your topic.
                </p>
              </div>
            </div>

            {/* Export Options Card */}
            <div className="relative flex-1 bg-[#887AD2] border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col overflow-hidden group hover:-translate-y-1 transition-transform rounded-xl">
              <CloudDownload className="text-white w-10 h-10 mb-auto" />
              <div className="mt-8">
                <h3 className="text-white font-bold text-lg mb-2 uppercase">Export Options</h3>
                <p className="text-white/90 font-medium text-sm md:text-base">
                  Download results as CSV or integrate directly with your favorite LMS.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default EngagementSection;
