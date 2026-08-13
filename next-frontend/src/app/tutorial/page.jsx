import React from 'react';
import Link from 'next/link';
import { tutorialData } from '@/lib/tutorialData';
import { BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Tutorials | Zinko',
  description: 'Learn how to play Zinko games and minigames',
};

export default function TutorialHubPage() {
  return (
    <>
      <div className="min-h-screen pt-24 pb-12 zk-workspace-bg">
        
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center animate-fade-in-up">
          <h1 className="zk-section-title text-6xl md:text-8xl mb-6" style={{ textShadow: '4px 4px 0px rgba(0,0,0,1)' }}>
            <span className="text-zk-white">Zinko</span> <span className="text-zk-yellow">Tutorials</span>
          </h1>
          <p className="font-['Outfit'] font-bold text-zk-text text-xl md:text-2xl max-w-3xl mx-auto tracking-wide leading-relaxed" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
            Scroll down to master the mechanics of every Zinko game mode. Learn the rules, discover pro tips, and dominate the leaderboard!
          </p>
        </div>

        {/* Long Scrollable Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          {tutorialData.map((tutorial, index) => {
            const isEven = index % 2 === 0;

            return (
              <div 
                key={tutorial.id} 
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
              >
                {/* Image Side */}
                <div className="w-full lg:w-1/2 relative group">
                  <div className={`absolute inset-0 ${tutorial.color} rounded-[1.5rem] transform ${isEven ? '-rotate-3 translate-x-3' : 'rotate-3 -translate-x-3'} translate-y-3 border border-zk-border`} />
                  <div className="relative border border-zk-border rounded-[1.5rem] overflow-hidden bg-zk-panel-bg aspect-square md:aspect-[4/3] flex items-center justify-center p-8 group-hover:-translate-y-2 transition-transform duration-300">
                    <img 
                      src={tutorial.image} 
                      alt={tutorial.title} 
                      className="w-full h-full object-contain drop-shadow-xl"
                    />
                  </div>
                </div>

                {/* Text Side */}
                <div className="w-full lg:w-1/2 space-y-5">
                  <div>
                    <h2 className="font-['Amatic_SC'] font-bold text-3xl text-zk-text mb-2 uppercase tracking-wide" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>
                      {tutorial.title}
                    </h2>
                    <p className="font-sans font-bold text-base text-zk-text/80 leading-relaxed">
                      {tutorial.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {tutorial.sections.map((section, sIndex) => (
                      <div key={sIndex} className="zk-panel-glass p-4 bg-zk-white/90 !shadow-none">
                        <h3 className="font-['Outfit'] font-black text-base uppercase tracking-tight text-zk-text mb-1.5 flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${tutorial.color} border border-zk-border inline-block`} />
                          {section.heading}
                        </h3>
                        <p className="font-sans font-medium text-xs text-zk-text/90 leading-relaxed">
                          {section.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Call to Action removed as per user request to remove one footer */}

      </div>
    </>
  );
}
