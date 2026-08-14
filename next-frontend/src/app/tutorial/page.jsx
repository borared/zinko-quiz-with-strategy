import React from 'react';
import Link from 'next/link';
import { tutorialData } from '@/lib/tutorialData';
import { BookOpen } from 'lucide-react';
import FlashcardStack from '@/components/tutorial/FlashcardStack';
import LineMatchingStack from '@/components/tutorial/LineMatchingStack';
import DragAndOrderStack from '@/components/tutorial/DragAndOrderStack';
import GuessPictureStack from '@/components/tutorial/GuessPictureStack';
import BaseQuizStack from '@/components/tutorial/BaseQuizStack';

export const metadata = {
  title: 'Tutorials | Zinko',
  description: 'Learn how to play Zinko games and minigames',
};

export default function TutorialHubPage() {
  return (
    <>
      <div className="min-h-screen pt-24 pb-12 bg-zk-panel-bg">
        
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center animate-fade-in-up">
          <h1 className="zk-section-title text-6xl md:text-8xl mb-6">
            <span>Zinko</span> <span className="text-zk-purple dark:text-zk-yellow">Tutorials</span>
          </h1>
          <p className="font-['Outfit'] font-normal text-zk-text text-xl md:text-2xl max-w-3xl mx-auto tracking-wide leading-relaxed">
            Scroll down to master the mechanics of every Zinko game mode. Learn the rules, discover pro tips, and dominate the leaderboard!
          </p>
        </div>

        {/* Long Scrollable Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          {Object.entries(
            tutorialData.reduce((acc, tutorial) => {
              if (!acc[tutorial.category]) acc[tutorial.category] = [];
              acc[tutorial.category].push(tutorial);
              return acc;
            }, {})
          ).map(([category, tutorials]) => (
            <div key={category} className="space-y-20 pt-10">
              <div className="text-center pb-6 border-b-4 border-dashed border-zk-border/30 max-w-3xl mx-auto">
                <h2 className="gasoek-one-regular text-4xl md:text-5xl text-zk-purple dark:text-zk-yellow tracking-wide">
                  {category}
                </h2>
              </div>
              <div className="space-y-32">
                {tutorials.map((tutorial, index) => {
                  const isEven = index % 2 === 0;

                  return (
                    <div 
                      key={tutorial.id} 
                      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
                    >
                {/* Image Side */}
                <div className="w-full lg:w-1/2 relative group z-10">
                  <div className={`absolute inset-0 ${tutorial.color} rounded-[1.5rem] transform ${isEven ? '-rotate-3 translate-x-3' : 'rotate-3 -translate-x-3'} translate-y-3 border border-zk-border`} />
                  <div className={`relative rounded-[1.5rem] flex items-center justify-center aspect-square md:aspect-[4/3] group-hover:-translate-y-2 transition-transform duration-300 w-full ${
                    tutorial.id === 'flashcards' || tutorial.id === 'line-matching' || tutorial.id === 'drag-and-order' || tutorial.id === 'guess-picture' || tutorial.id === 'base-quiz'
                      ? 'p-0 overflow-visible'
                      : 'border border-zk-border bg-zk-panel-bg p-8 overflow-hidden'
                  }`}>
                    {tutorial.id === 'flashcards' ? (
                      <FlashcardStack />
                    ) : tutorial.id === 'line-matching' ? (
                      <LineMatchingStack />
                    ) : tutorial.id === 'drag-and-order' ? (
                      <DragAndOrderStack />
                    ) : tutorial.id === 'guess-picture' ? (
                      <GuessPictureStack />
                    ) : tutorial.id === 'base-quiz' ? (
                      <BaseQuizStack />
                    ) : (
                      <img 
                        src={tutorial.image} 
                        alt={tutorial.title} 
                        className="w-full h-full object-contain drop-shadow-xl"
                      />
                    )}
                  </div>
                </div>

                {/* Text Side */}
                <div className="w-full lg:w-1/2 space-y-5">
                  <div>
                    <h2 className="font-['Amatic_SC'] font-bold text-3xl text-zk-text mb-2 uppercase tracking-wide" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>
                      {tutorial.title}
                    </h2>
                    <p className="font-['Outfit'] font-semibold text-lg text-zk-text/80 leading-relaxed">
                      {tutorial.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {tutorial.sections.map((section, sIndex) => (
                      <div key={sIndex} className="zk-panel-glass p-4 bg-zk-white/90 !shadow-none border-[1px] border-zk-border/30">
                        <h3 className="font-['Outfit'] font-bold text-base tracking-tight text-zk-text mb-1.5 flex items-center gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full ${tutorial.color} border border-zk-border/40 inline-block`} />
                          {section.heading}
                        </h3>
                        <p className="font-['Outfit'] font-normal text-base text-zk-text/80 leading-relaxed">
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
            </div>
          ))}
        </div>

        {/* Footer Call to Action removed as per user request to remove one footer */}

      </div>
    </>
  );
}
