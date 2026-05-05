import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full border-b-[4px] border-zk-black bg-zk-yellow px-6 py-4 flex items-center justify-between font-sans">
      
      {/* Left: Logo */}
      <div className="flex items-center gap-8">
        <a 
          href="/" 
          className="bg-zk-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-1 flex items-center justify-center transform transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <span className="font-bold text-2xl tracking-tighter italic permanent-marker-regular">Zinko</span>
        </a>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 font-bold text-sm">
          <a 
            href="#games" 
            className="bg-zk-blue text-zk-black border-[2px] border-zk-black px-4 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            HOME
          </a>
          <a href="#blog" className="text-zk-black hover:underline decoration-[2px] underline-offset-4">
            BLOG
          </a>
          <a href="#pricing" className="text-zk-black hover:underline decoration-[2px] underline-offset-4">
            PRICING
          </a>
          <a href="#classpin" className="text-zk-black hover:underline decoration-[2px] underline-offset-4">
            CLASSPIN
          </a>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 font-bold text-sm">
        <button 
          className="bg-zk-blue text-zk-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-2 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
        >
          MY LIBRARY
        </button>
        <button 
          onClick={() => navigate('/signup')}
          className="bg-zk-white text-zk-black border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-2 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
        >
          SIGN UP
        </button>
      </div>

    </nav>
  );
};

export default Navbar;
