"use client";
import React from 'react';
import { Quote } from 'lucide-react';

const Testimonial = () => {
  return (
    <div className="w-full max-w-6xl mx-auto mt-20 mb-20">
      <div className="bg-zk-blue border-2 border-zk-border p-8 md:p-12 flex flex-col lg:flex-row items-center gap-10 rounded-xl">
        
        {/* Left Side: Quote */}
        <div className="flex-1 text-white">
          <Quote className="text-zk-yellow mb-4" size={48} fill="currentColor" />
          <p className="text-2xl md:text-3xl font-bold italic mb-8 leading-tight">
            "Zinko Play transformed my Friday review sessions. The kids are literally jumping out of their seats to answer questions. It's the highlight of our week!"
          </p>
          
          {/* Profile Box */}
          <div className="inline-flex items-center gap-4">
            <div className="w-16 h-16 bg-zk-bg border-2 border-zk-border p-1 rounded-xl">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=FFD12B" alt="Sarah Jenkins" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">Sarah Jenkins</h4>
              <p className="text-sm font-bold text-white/80">5th Grade Science Teacher</p>
            </div>
          </div>
        </div>

        {/* Right Side: Stats Box */}
        <div className="w-full lg:w-1/3 bg-zk-panel-bg border-2 border-zk-border p-8 text-center flex flex-col justify-center rounded-xl">
          
          <div className="mb-6">
            <h3 className="text-5xl font-black text-[#5D3FD3] mb-1 tracking-tighter">50k+</h3>
            <p className="text-xs font-black text-zk-text uppercase tracking-wider">Active Teachers</p>
          </div>
          
          <div className="w-full h-[3px] bg-zk-black mb-6"></div>
          
          <div>
            <h3 className="text-5xl font-black text-[#FF6B4A] mb-1 tracking-tighter">2M+</h3>
            <p className="text-xs font-black text-zk-text uppercase tracking-wider">Games Played</p>
          </div>
          
        </div>
        
      </div>
    </div>
  );
};

export default Testimonial;
