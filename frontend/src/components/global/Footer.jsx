import React from 'react';
import { Share2, AtSign } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white py-16 px-6 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Column 1: Brand & About */}
        <div className="flex flex-col gap-6">
          <div className="inline-block">
            <div className="bg-white px-4 py-2 inline-flex items-center justify-center border-2 border-transparent">
              <span className="text-black font-bold text-3xl tracking-tighter italic permanent-marker-regular">
                Zinko
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed pr-4">
            Making learning visible and fun for students across the globe. Join the game revolution.
          </p>
        </div>

        {/* Column 2: Products */}
        <div className="flex flex-col gap-4">
          <h4 className="text-zk-yellow font-bold text-lg mb-2">PRODUCTS</h4>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Game Maker</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Library</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Pricing</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Zinko Pro</a>
        </div>

        {/* Column 3: Support */}
        <div className="flex flex-col gap-4">
          <h4 className="text-zk-yellow font-bold text-lg mb-2">SUPPORT</h4>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Help Center</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Contact Us</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Privacy Policy</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Terms of Service</a>
        </div>

        {/* Column 4: Follow Us */}
        <div className="flex flex-col gap-4">
          <h4 className="text-zk-yellow font-bold text-lg mb-2">FOLLOW US</h4>
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="bg-white text-black p-2 hover:bg-gray-200 transition-colors flex items-center justify-center"
              aria-label="Share"
            >
              <Share2 size={24} strokeWidth={2} />
            </a>
            <a 
              href="#" 
              className="bg-white text-black p-2 hover:bg-gray-200 transition-colors flex items-center justify-center"
              aria-label="Email / At"
            >
              <AtSign size={24} strokeWidth={2} />
            </a>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        Copyright © 2026, Zinko All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
