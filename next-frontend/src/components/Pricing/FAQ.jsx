"use client";
import React from 'react';
import { Banknote, GraduationCap, Users, Smartphone, Lock, Wifi, ChevronDown } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      icon: Banknote,
      question: "Can I cancel anytime?",
      answer: "Absolutely! No strings attached. You can downgrade to the Free plan at the end of your billing cycle."
    },
    {
      icon: GraduationCap,
      question: "Do you offer teacher discounts?",
      answer: "Our Pro plan is already priced specifically for individual teachers, but we offer bulk discounts for 5+ licenses."
    },
    {
      icon: Users,
      question: "How many players can join a game?",
      answer: "Up to 50 players can join a game on the Free plan, and up to 500 on the Pro plan!"
    },
    {
      icon: Smartphone,
      question: "Do I need to install an app to play?",
      answer: "No! Players can join directly from their web browser on any device (phone, tablet, or computer)."
    },
    {
      icon: Lock,
      question: "Are my quizzes private?",
      answer: "Yes, you can set your quizzes to be private so only you can see them, or share them publicly with the community."
    },
    {
      icon: Wifi,
      question: "What happens if my internet disconnects?",
      answer: "Don't worry! Zinko automatically saves your progress, and you can reconnect to the game instantly."
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-24 px-4 bg-transparent">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-zk-text tracking-tight gasoek-one-regular mb-2">
          Frequently Asked Questions
        </h2>
        <p className="font-['Outfit'] font-bold text-zk-text/60 text-lg uppercase tracking-widest">
          FAQ
        </p>
      </div>

      <div className="flex flex-col border-t-2 border-zk-border">
        {faqs.map((faq, idx) => {
          const Icon = faq.icon;
          return (
            <div 
              key={idx} 
              className="group border-b-2 border-zk-border transition-colors hover:bg-zk-black/5"
            >
              <div className="flex items-center justify-between py-6 px-2 sm:px-4 cursor-pointer">
                <div className="flex items-center gap-4 sm:gap-6">
                  <Icon size={28} className="text-zk-text shrink-0" strokeWidth={2.5} />
                  <h3 className="text-lg sm:text-xl font-bold text-zk-text m-0">{faq.question}</h3>
                </div>
                <ChevronDown 
                  size={24} 
                  strokeWidth={3}
                  className="text-zk-text/50 transition-transform duration-300 group-hover:rotate-180 shrink-0 ml-4" 
                />
              </div>
              
              <div className="grid transition-all duration-300 ease-in-out grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100">
                <div className="overflow-hidden">
                  <p className="px-2 sm:px-4 pb-6 ml-12 sm:ml-14 text-sm sm:text-base font-bold text-zk-text/70 leading-relaxed max-w-2xl">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;
