"use client";
import React from 'react';
import { CheckCircle2, XCircle, Star, Building2 } from 'lucide-react';

const PricingCard = ({ 
  title, 
  price, 
  originalPrice,
  subtitle, 
  features, 
  buttonText, 
  isPopular, 
  theme = 'basic' 
}) => {
  
  // Theme logic
  const isPro = theme === 'pro';
  const isSchool = theme === 'school';
  
  const cardBorderClass = isPro ? 'border-[#6E5CF2]' : 
                          isSchool ? 'border-zk-border hover:border-zk-pink hover:shadow-[0_0_20px_rgba(255,95,168,0.6)]' : 
                          'border-zk-border';
  const buttonBgClass = isPro ? 'bg-[#6E5CF2] text-white hover:bg-zk-blue border-zk-border transition-colors' : 
                        isSchool ? 'bg-[#5D3FD3] text-white hover:bg-zk-blue border-zk-border transition-colors' : 
                        'bg-zk-panel-bg text-zk-text hover:border-zk-purple hover:shadow-[0_0_15px_rgba(93,63,211,0.5)] border-zk-border transition-all';
                        
  const getIcon = (type) => {
    switch(type) {
      case 'check': return <CheckCircle2 className="text-green-500 min-w-[20px]" size={20} />;
      case 'cross': return <XCircle className="text-gray-400 min-w-[20px]" size={20} />;
      case 'star': return <Star className="text-[#6E5CF2] fill-[#6E5CF2] min-w-[20px]" size={20} />;
      case 'building': return <Building2 className="text-[#5D3FD3] min-w-[20px]" size={20} />;
      default: return <CheckCircle2 className="text-green-500 min-w-[20px]" size={20} />;
    }
  };

  return (
    <div className={`relative flex flex-col h-full bg-zk-panel-bg border-2 ${cardBorderClass} rounded-xl p-8 transition-all duration-300 hover:-translate-y-4`}>
      
      {isPopular && (
        <>
          <style>{`
            @keyframes card-shine {
              0% { left: -100%; opacity: 0; }
              15% { left: -100%; opacity: 1; }
              50% { left: 200%; opacity: 1; }
              100% { left: 200%; opacity: 0; }
            }
          `}</style>
          <div className="absolute inset-0 z-0 pointer-events-none rounded-xl overflow-hidden">
            <div 
              className="absolute top-0 bottom-0 w-[25%]"
              style={{ 
                transform: 'skewX(-20deg)',
                animation: 'card-shine 8s ease-in-out infinite',
                background: 'linear-gradient(to right, transparent, rgba(255,215,0,0.25), rgba(255,105,180,0.25), rgba(0,255,255,0.25), transparent)'
              }}
            />
          </div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF6B4A] text-white font-black text-[10px] sm:text-xs px-3 sm:px-4 py-1 uppercase tracking-wider border-2 border-zk-border whitespace-nowrap z-10 rounded-lg">
            Most Popular
          </div>
        </>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-zk-text mb-2 flex items-center gap-2">
          {title.split(' ').map((word, i) => {
            if (word === 'Pro' || word === 'Prime') {
              const bgClass = word === 'Prime' ? 'bg-zk-pink' : 'bg-zk-blue';
              return (
                <span key={i} className={`${bgClass} text-white rounded-lg px-3 py-0.5 text-[22px] inline-flex items-center justify-center`}>
                  {word}
                </span>
              );
            }
            if (word === 'Zamba') {
              return (
                <span key={i} className="font-bold text-[28px] sm:text-3xl tracking-tighter italic permanent-marker-regular pt-1">
                  {word}
                </span>
              );
            }
            return <span key={i}>{word}</span>;
          })}
        </h3>
        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
          <span className="text-5xl font-black text-zk-text tracking-tighter">{price}</span>
          {originalPrice && (
            <span className="text-xl font-bold text-zk-text/40 line-through decoration-1 decoration-zk-text">
              {originalPrice}
            </span>
          )}
          {price !== 'Free' && price !== 'Custom' && <span className="font-bold text-zk-text/60">/mo</span>}
        </div>
        <p className="text-sm font-bold text-zk-text/60">{subtitle}</p>
      </div>

      <ul className="flex flex-col gap-4 mb-8 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start sm:items-center gap-3 text-sm font-bold text-zk-text/80">
            <div className="mt-0.5 sm:mt-0">{getIcon(feature.icon)}</div>
            <span className={feature.icon === 'cross' ? 'text-gray-400 line-through decoration-2' : ''}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {isPopular ? (
        <div className="relative w-full rounded-lg overflow-hidden p-[3px] transition-transform hover:translate-y-[2px] hover:translate-x-[2px] active:translate-y-[4px] active:translate-x-[4px]">
          <div className="absolute inset-0 bg-zk-black" />
          <div className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2">
            <div 
              className="w-full h-full animate-[spin_6s_linear_infinite]"
              style={{ background: 'conic-gradient(from 0deg, transparent 0 240deg, #FF6B4A 280deg, #00FFFF 320deg, transparent 360deg)' }} 
            />
          </div>
          <button className="relative w-full h-full py-4 bg-[#6E5CF2] text-white hover:bg-zk-blue font-black uppercase tracking-wider text-sm rounded-[5px]">
            {buttonText}
          </button>
        </div>
      ) : (
        <button className={`w-full py-4 font-black uppercase tracking-wider text-sm border-2 rounded-lg transition-transform hover:translate-y-[2px] hover:translate-x-[2px] active:translate-y-[4px] active:translate-x-[4px] ${buttonBgClass}`}>
          {buttonText}
        </button>
      )}
      
    </div>
  );
};

export default PricingCard;
