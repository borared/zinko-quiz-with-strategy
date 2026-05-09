import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Valid game PIN — change this when integrating with the backend
const VALID_PIN = '123456';

const EnterPinSection = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // only allow numbers
    if (value.length <= 6) {
      setPin(value);
      setError(''); // clear error on new input
    }
  };

  const handleEnter = () => {
    if (pin.length < 6) {
      setError('Please enter a full 6-digit PIN.');
      return;
    }
    if (pin !== VALID_PIN) {
      setError('Invalid PIN. Try: 123456');
      return;
    }
    navigate('/join-nickname');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-zk-yellow w-full py-20 px-4 font-sans">
      
      {/* Decorative Elements */}
      <div className="absolute top-12 left-12 md:top-24 md:left-32 w-16 h-16 md:w-24 md:h-24 rounded-full border-[3px] border-black/10 bg-black/5 pointer-events-none" />
      <div className="absolute bottom-24 right-12 md:bottom-32 md:right-32 w-20 h-20 md:w-32 md:h-32 rotate-45 border-[3px] border-black/10 bg-black/5 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center">
        
        {/* Title */}
        <div className="text-center mb-8 permanent-marker-regular">
          <h2 className="text-4xl md:text-5xl font-bold text-zk-black mb-2 uppercase tracking-wide">
            Join
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-zk-black uppercase tracking-wide">
            Enter 6 Digit Number
          </h3>
        </div>

        {/* Card */}
        <div className="w-full bg-white border-[4px] border-zk-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 flex flex-col gap-4">
          
          {/* Input Box */}
          <div className="w-full">
            <input 
              type="text" 
              value={pin}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
              placeholder="0 0 0 0 0 0"
              className="w-full border-[3px] border-zk-black p-4 text-center text-3xl md:text-4xl tracking-[0.3em] md:tracking-[0.5em] font-bold text-zk-black placeholder-gray-200 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-center text-sm font-bold text-red-500 border-[2px] border-red-300 bg-red-50 py-2 px-4">
              {error}
            </p>
          )}

          {/* Enter Button */}
          <button 
            onClick={handleEnter}
            className="w-full bg-[#5D3FD3] hover:bg-zk-blue text-white border-[3px] border-zk-black py-4 font-black text-xl uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
          >
            Enter
          </button>

        </div>

        {/* Hint */}
        <p className="mt-4 text-xs font-bold text-zk-black/40 uppercase tracking-wider">
          Hint: use PIN <span className="text-zk-black/60">123456</span>
        </p>

      </div>
    </div>
  );
};

export default EnterPinSection;
