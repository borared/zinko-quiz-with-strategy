"use client";
import React from 'react';
import { Zap, Users, TrendingUp, Palette, CloudDownload, Rocket, Crown, Trophy, Sparkles } from 'lucide-react';

const EngagementSection = () => {
  const features = [
    {
      id: "01",
      title: "Instant Game Creation",
      description: "Turn any list of questions into a competitive classroom experience in under 2 minutes.",
      color: "#FF6B4A",
      icon: Zap,
      visual: (
        <div className="w-72 h-48 md:w-80 md:h-52 bg-[#FF6B4A] border-2 border-zk-border rounded-xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-zk-panel-bg border-[1.5px] border-zk-border px-2 py-0.5 font-bold text-xs rounded z-10">
            QUICK START
          </div>
          {/* Fun 2.5D Rocket Launch */}
          <div className="relative w-44 h-28 flex items-center justify-center rotate-[-15deg] transition-transform duration-300 hover:rotate-0">
            {/* Fire and Smoke Puffs */}
            <div className="absolute bottom-2 -left-2 flex gap-1">
              <div className="w-6 h-6 rounded-full bg-yellow-400 animate-ping"></div>
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
            </div>
            <div className="absolute bottom-4 -left-6 w-8 h-8 rounded-full bg-white/30"></div>
            <div className="absolute bottom-2 -left-8 w-6 h-6 rounded-full bg-white/20"></div>
            
            {/* The Rocket */}
            <div className="relative p-6 bg-white border-2 border-zk-border rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
              <Rocket className="text-[#FF6B4A] w-14 h-14 fill-[#FF6B4A]/10 stroke-[2.5px]" />
              <Sparkles className="absolute text-yellow-300 w-6 h-6 -top-2 -right-2 animate-pulse" />
            </div>
          </div>
        </div>
      ),
      rotate: "rotate-3"
    },
    {
      id: "02",
      title: "Collaborative Play",
      description: "Students can join from any device using a simple Class PIN. No accounts needed for kids!",
      color: "#6E5CF2",
      icon: Users,
      visual: (
        <div className="w-72 h-48 md:w-80 md:h-52 bg-[#6E5CF2] border-2 border-zk-border rounded-xl relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-zk-panel-bg border-[1.5px] border-zk-border px-2 py-0.5 font-bold text-xs z-10 rounded">
            MULTIPLAYER
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-90">
            <img
              src="/collaborative_play.png"
              alt="Students playing"
              className="w-full h-full object-cover object-left"
            />
          </div>
          <div className="absolute left-6 bottom-6">
            <Users className="text-white w-14 h-14" />
          </div>
        </div>
      ),
      rotate: "-rotate-3"
    },
    {
      id: "03",
      title: "Live Analytics",
      description: "Track student progress in real-time as they play through your games.",
      color: "#6E5CF2",
      icon: TrendingUp,
      visual: (
        <div className="w-72 h-48 md:w-80 md:h-52 bg-[#0B0F19] border-2 border-zk-border rounded-xl flex items-center justify-center relative overflow-hidden">
          {/* Fun 2.5D Leaderboard Podium */}
          <div className="relative w-44 h-28 flex items-end justify-center gap-2 pb-4 rotate-[8deg] transition-transform duration-300 hover:rotate-0">
            {/* 2nd place block */}
            <div className="w-10 bg-[#3182CE] border-2 border-zk-border rounded-t-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] h-14 flex items-center justify-center font-black text-white font-['Outfit']">2</div>
            {/* 1st place block */}
            <div className="w-12 bg-[#FFD12B] border-2 border-zk-border rounded-t-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] h-20 flex items-center justify-center font-black text-zk-border font-['Outfit'] relative">
              1
              {/* Crown Floating above */}
              <Crown className="absolute text-[#FFD12B] fill-[#FFD12B] stroke-zk-border stroke-2 w-8 h-8 -top-8 left-1/2 -translate-x-1/2 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] animate-bounce" style={{ animationDuration: '2.5s' }} />
            </div>
            {/* 3rd place block */}
            <div className="w-10 bg-[#48BB78] border-2 border-zk-border rounded-t-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] h-10 flex items-center justify-center font-black text-white font-['Outfit']">3</div>
          </div>
        </div>
      ),
      rotate: "rotate-2"
    },
    {
      id: "04",
      title: "Custom Themes",
      description: "Pick from dozens of high-energy visual styles to match your topic.",
      color: "#FFD12B",
      icon: Palette,
      visual: (
        <div className="w-72 h-48 md:w-80 md:h-52 bg-[#FFD12B] border-2 border-zk-border rounded-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-36 h-36 md:w-40 md:h-40">
            <img
              src="https://res.cloudinary.com/dicrvjstp/image/upload/v1777974595/paint-brush-with-paint-paint-it_1025830-89081_cncmdd.png"
              alt="Paint Brush"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute left-6 bottom-6">
            <Palette className="text-zk-text w-14 h-14" />
          </div>
        </div>
      ),
      rotate: "-rotate-2"
    },
    {
      id: "05",
      title: "Export Options",
      description: "Download results as CSV or integrate directly with your favorite LMS.",
      color: "#887AD2",
      icon: CloudDownload,
      visual: (
        <div className="w-72 h-48 md:w-80 md:h-52 bg-[#887AD2] border-2 border-zk-border rounded-xl flex items-center justify-center relative overflow-hidden">
          {/* Fun 2.5D Trophy and Confetti */}
          <div className="relative w-44 h-28 flex items-center justify-center rotate-[-8deg] transition-transform duration-300 hover:rotate-0">
            {/* Floating Confetti dots */}
            <div className="absolute top-4 left-6 w-3 h-3 rounded-full bg-yellow-300 animate-ping"></div>
            <div className="absolute top-12 right-6 w-2.5 h-2.5 rounded-full bg-red-400"></div>
            <div className="absolute bottom-6 left-12 w-2 h-2 rounded-full bg-blue-300"></div>
            
            {/* Golden Trophy box */}
            <div className="relative p-6 bg-white border-2 border-zk-border rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
              <Trophy className="text-[#FFD12B] fill-[#FFD12B]/10 w-14 h-14 stroke-[2.5px]" />
              
              {/* Down Arrow / Download circle */}
              <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-[#27AE60] border-2 border-zk-border rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                <CloudDownload className="text-white w-4 h-4 stroke-[3px]" />
              </div>
            </div>
          </div>
        </div>
      ),
      rotate: "rotate-3"
    }
  ];

  return (
    <section className="bg-zk-panel-bg py-24 px-4 font-sans border-b-2 border-zk-border overflow-hidden">
      <div className="max-w-5xl mx-auto">
        
        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-black text-zk-text mb-24 text-center gasoek-one-regular tracking-tight">
          Built for Maximum Engagement
        </h2>

        {/* Alternating List */}
        <div className="flex flex-col gap-24 md:gap-32 w-full">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;

            return (
              <div 
                key={feature.id} 
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-20 w-full`}
              >
                {/* Text Section */}
                <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start max-w-lg">
                  <span className="text-[#FFCD29] font-['Outfit'] font-black text-2xl md:text-3xl tracking-wider mb-2">
                    {feature.id}.
                  </span>
                  
                  <h3 className="gasoek-one-regular text-2xl md:text-3xl text-zk-text mb-4 uppercase tracking-wide">
                    {feature.title}
                  </h3>
                  
                  <p className="text-zk-text/80 font-['Outfit'] font-medium text-base md:text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Visual Card Section */}
                <div className="flex-1 flex justify-center items-center">
                  <div className={`transition-all duration-300 hover:scale-105 hover:rotate-0 cursor-pointer ${feature.rotate}`}>
                    {feature.visual}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default EngagementSection;
