"use client";
import React from 'react';
import { CheckCircle2, XCircle, Star, Building2 } from 'lucide-react';

const PricingCard = ({ 
  title, 
  price, 
  subtitle, 
  features, 
  buttonText, 
  isPopular, 
  theme = 'basic' 
}) => {
  
  // Theme logic
  const isPro = theme === 'pro';
  const isSchool = theme === 'school';
  
  const cardBorderClass = isPro ? 'border-[#6E5CF2]' : 'border-zk-black';
  const buttonBgClass = isPro ? 'bg-[#6E5CF2] text-white hover:bg-zk-blue border-zk-black' : 
                        isSchool ? 'bg-[#5D3FD3] text-white hover:bg-zk-blue border-zk-black' : 
                        'bg-white text-zk-black hover:bg-gray-100 border-zk-black';
                        
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
    <div className={`relative flex flex-col h-full bg-white border-[4px] ${cardBorderClass} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 transition-transform duration-300 hover:-translate-y-4`}>
      
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF6B4A] text-white font-black text-[10px] sm:text-xs px-3 sm:px-4 py-1 uppercase tracking-wider border-[3px] border-zk-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap z-10 rounded-lg">
          Most Popular
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-zk-black mb-1">{title}</h3>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-5xl font-black text-zk-black tracking-tighter">{price}</span>
          {price !== 'Free' && price !== 'Custom' && <span className="font-bold text-zk-black/60">/mo</span>}
        </div>
        <p className="text-sm font-bold text-zk-black/60">{subtitle}</p>
      </div>

      <ul className="flex flex-col gap-4 mb-8 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start sm:items-center gap-3 text-sm font-bold text-zk-black/80">
            <div className="mt-0.5 sm:mt-0">{getIcon(feature.icon)}</div>
            <span className={feature.icon === 'cross' ? 'text-gray-400 line-through decoration-2' : ''}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <button className={`w-full py-4 font-black uppercase tracking-wider text-sm border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none ${buttonBgClass}`}>
        {buttonText}
      </button>
      
    </div>
  );
};

export default PricingCard;
