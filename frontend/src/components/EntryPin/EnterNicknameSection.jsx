import React, { useState } from 'react';
import { Rocket, QrCode, ArrowLeftCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const EnterNicknameSection = () => {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleEnter = () => {
    if (nickname.trim().length === 0) return;
    navigate('/choose-team');
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden bg-zk-yellow px-4 py-20 font-sans">
      
      {/* Floating Decorative Elements */}
      <motion.div 
        animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 left-16 md:top-24 md:left-32 w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#D4A322]/40 border-[3px] border-zk-black/10 pointer-events-none" 
      />
      
      <motion.div 
        animate={{ y: [15, -15, 15], rotate: [45, 60, 45] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-24 right-12 md:bottom-32 md:right-32 w-20 h-20 md:w-32 md:h-32 rotate-45 bg-[#FFB020]/60 border-[3px] border-zk-black/10 pointer-events-none" 
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center">
        
        {/* Card */}
        <div className="w-full bg-white border-[4px] border-zk-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 flex flex-col items-center">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black italic text-zk-black mb-2 uppercase tracking-tight permanent-marker-regular">
              Get in the game!
            </h2>
            <p className="text-sm font-bold text-zk-black/60">
              Your squad is waiting for you.
            </p>
          </div>

          {/* Input Group */}
          <div className="w-full mb-6">
            <label className="block text-xs font-black text-zk-black uppercase tracking-wider mb-2">
              Choose Nickname
            </label>
            <input 
              type="text" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="TYPE SOMETHING COOL..."
              className="w-full border-[3px] border-zk-black p-4 text-center text-sm md:text-base font-bold text-zk-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all uppercase"
            />
          </div>

          {/* Enter Button */}
          <button 
            onClick={handleEnter}
            className="w-full flex items-center justify-center gap-2 bg-[#5D3FD3] hover:bg-zk-blue text-white border-[3px] border-zk-black py-4 px-6 font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none mb-8"
          >
            Enter <Rocket size={18} />
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 mb-8">
            <div className="flex-1 h-[2px] bg-gray-200"></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Or</span>
            <div className="flex-1 h-[2px] bg-gray-200"></div>
          </div>

          {/* Bottom Actions */}
          <div className="w-full grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 bg-[#E5E7EB] hover:bg-gray-300 text-zk-black border-[3px] border-zk-black py-3 px-2 font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none">
              <QrCode size={16} /> Scan QR
            </button>
            <button 
              onClick={() => navigate('/join')}
              className="flex items-center justify-center gap-2 bg-[#E5E7EB] hover:bg-gray-300 text-zk-black border-[3px] border-zk-black py-3 px-2 font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none">
              <ArrowLeftCircle size={16} /> New PIN
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EnterNicknameSection;
