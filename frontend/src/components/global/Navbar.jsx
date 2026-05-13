import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Bell, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  console.log('Navbar - isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'user:', user);

  const handleSignOut = () => {
    setShowModal(true);
  };

  if (!isLoaded) return null; // Don't render until loaded to avoid flickering

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b-[4px] border-zk-black bg-zk-yellow px-6 py-4 flex items-center justify-between font-sans">
      
      {/* Left: Logo */}
      <div className="flex items-center gap-8">
        <a 
          href="/" 
          className="bg-zk-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-1 flex items-center justify-center transform transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg"
        >
          <span className="font-bold text-2xl tracking-tighter italic permanent-marker-regular">Zinko</span>
        </a>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 font-bold text-sm">
          <a 
            href="#home" 
            className="bg-zk-blue text-zk-white border-[2px] border-zk-black px-4 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg"
          >
            HOME
          </a>
          <a href="#blog" className="text-zk-black hover:underline decoration-[2px] underline-offset-4">
            BLOG
          </a>
          <a
          onClick={() => navigate('/pricing')}
          className="hover:cursor-pointer text-zk-black hover:underline decoration-[2px] underline-offset-4">
            PRICING
          </a>
          <a href="#classpin" className="text-zk-black hover:underline decoration-[2px] underline-offset-4">
            CLASSPIN
          </a>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 font-bold text-sm">
        {isSignedIn ? (
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/create-game')}
              className="bg-[#5D3FD3] text-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-2 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none font-bold text-lg rounded-lg"
            >
              Create New Game
            </button>
            <button className="text-zk-black hover:scale-105 transition-transform">
              <Bell size={28} />
            </button>
            <button className="text-zk-black hover:scale-105 transition-transform">
              <Settings size={28} />
            </button>
            <div className="relative">
              <div 
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-12 h-12 border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white cursor-pointer rounded-xl"
              >
                <img src={user?.imageUrl} alt={user?.firstName} className="w-full h-full object-cover" />
              </div>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 rounded-xl">
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zk-yellow border-b-[2px] border-zk-black font-bold text-zk-black rounded-lg"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zk-yellow font-bold text-red-600"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <button 
              onClick={() => navigate('/join')}
              className="bg-zk-blue text-zk-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-2 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none rounded-lg"
            >
              JOIN
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-zk-white text-zk-black border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-2 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none rounded-lg"
            >
              SIGN UP
            </button>
          </>
        )}
      </div>
      {/* Sign Out Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="bg-zk-white border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-sm w-full mx-4 flex flex-col items-center rounded-xl"
          >
            <h3 className="text-2xl font-bold mb-2 text-zk-black permanent-marker-regular">SIGN OUT?</h3>
            <p className="text-zk-black/70 mb-6 text-center font-bold">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-zk-white text-zk-black border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 font-bold transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none rounded-lg"
              >
                CANCEL
              </button>
              <button 
                onClick={() => {
                  setShowModal(false);
                  signOut();
                }}
                className="flex-1 bg-[#FF4B4B] text-zk-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 font-bold transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none rounded-lg"
              >
                SURE!
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;
