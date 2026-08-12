import React from 'react';
import Link from 'next/link';
import { tutorialData } from '@/lib/tutorialData';
import ClientLayoutWrapper from '@/app/ClientLayoutWrapper';
import { BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Tutorials | Zinko',
  description: 'Learn how to play Zinko games and minigames',
};

export default function TutorialHubPage() {
  return (
    <ClientLayoutWrapper>
      <div className="min-h-screen pt-24 pb-12 zk-workspace-bg">
        
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center animate-fade-in-up">
          <h1 className="zk-section-title text-6xl md:text-8xl mb-6" style={{ textShadow: '4px 4px 0px rgba(0,0,0,1)' }}>
            <span className="text-zk-white">Zinko</span> <span className="text-zk-yellow">Tutorials</span>
          </h1>
          <p className="font-['Amatic_SC'] font-bold text-zk-text text-3xl md:text-5xl max-w-3xl mx-auto tracking-wide" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
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
                  <div className={`absolute inset-0 ${tutorial.color} rounded-[2rem] transform ${isEven ? '-rotate-3 translate-x-4' : 'rotate-3 -translate-x-4'} translate-y-4 shadow-[8px_8px_0_0_#000] border-4 border-zk-border`} />
                  <div className="relative border-4 border-zk-border rounded-[2rem] overflow-hidden bg-zk-panel-bg aspect-square md:aspect-[4/3] flex items-center justify-center p-8 group-hover:-translate-y-2 transition-transform duration-300">
                    <img 
                      src={tutorial.image} 
                      alt={tutorial.title} 
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>

                {/* Text Side */}
                <div className="w-full lg:w-1/2 space-y-8">
                  <div>
                    <h2 className="font-['Amatic_SC'] font-bold text-6xl text-zk-text mb-4 uppercase tracking-wide" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
                      {tutorial.title}
                    </h2>
                    <p className="font-sans font-bold text-2xl text-zk-text/80 leading-relaxed">
                      {tutorial.description}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {tutorial.sections.map((section, sIndex) => (
                      <div key={sIndex} className="zk-panel-glass p-6 bg-zk-white/90">
                        <h3 className="font-['Outfit'] font-black text-2xl uppercase tracking-tight text-zk-text mb-3 flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${tutorial.color} border-2 border-zk-border inline-block`} />
                          {section.heading}
                        </h3>
                        <p className="font-sans font-medium text-lg text-zk-text/90 leading-relaxed">
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

        {/* Footer Call to Action */}
        <div className="mt-32 max-w-4xl mx-auto px-4 text-center">
           <div className="inline-flex flex-col md:flex-row items-center gap-6 bg-zk-panel-bg border-4 border-zk-border p-8 md:p-12 rounded-3xl shadow-[8px_8px_0_0_#000]">
             <div className="w-20 h-20 bg-zk-purple rounded-full border-4 border-zk-border flex items-center justify-center text-zk-white shadow-[4px_4px_0_0_#000] rotate-[-10deg]">
                <BookOpen size={40} />
             </div>
             <div className="text-left">
               <h3 className="font-['Outfit'] font-black text-3xl uppercase tracking-tight text-zk-text mb-2">Ready to test your skills?</h3>
               <p className="font-sans font-bold text-xl text-zk-text/80 mb-4">You've mastered the theory. Now it's time for practice.</p>
               <Link href="/dashboard" className="zk-btn-press inline-block bg-zk-yellow text-zk-text px-8 py-4 rounded-xl font-['Amatic_SC'] font-bold text-3xl leading-none pt-2">
                 GO TO DASHBOARD
               </Link>
             </div>
           </div>
        </div>

      </div>
    </ClientLayoutWrapper>
  );
}
