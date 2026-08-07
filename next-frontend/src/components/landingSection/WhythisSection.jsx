"use client";
import React from 'react';
import { MonitorPlay, Smartphone, Trophy, Target } from 'lucide-react';

const features = [
  {
    icon: MonitorPlay,
    title: "Interactive Learning",
    description: "Make learning fun with gamified experiences, solo or with others."
  },
  {
    icon: Smartphone,
    title: "Real-Time Engagement",
    description: "Participate and get instant feedback in class, at work, or at home."
  },
  {
    icon: Trophy,
    title: "Collaboration & Connection",
    description: "Bring friends, students, or colleagues together for shared, playful learning."
  },
  {
    icon: Target,
    title: "Build more Strategy",
    description: "Go beyond simple recall. Craft dynamic games that encourage critical thinking and strategic planning."
  }
];

const WhyThis = () => {
  return (
    <section className="bg-zk-panel-bg py-24 px-4 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col items-center">

        {/* Title */}
        <h2 className="gasoek-one-regular text-3xl md:text-5xl font-bold text-zk-text mb-16 text-center">
          Why choose Zinko for engagement
        </h2>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 w-full text-center">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex flex-col items-center">
                <div className="mb-6 text-zk-blue">
                  <Icon size={48} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-zk-text mb-4">
                  {feature.title}
                </h3>
                <p className="text-zk-text/70 text-base leading-relaxed px-4">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyThis;
