"use client";
import React from 'react';
import Link from 'next/link';
import FooterLottie from '@/components/global/FooterLottie';

const Footer = () => {
  return (
    <footer className="relative z-20 bg-[#0a0a0a] text-white py-16 px-6 font-['Outfit']">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Column 1: Brand & About */}
        <div className="flex flex-col gap-6">
          <div className="inline-block">
            <div className="bg-white px-4 py-2 inline-flex items-center justify-center border-2 border-transparent">
              <span className="text-black font-bold text-3xl tracking-tighter italic permanent-marker-regular">
                Zamba
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
          <Link href="/create-game" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Game Maker</Link>
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Library</Link>
          <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
          <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Zamba Pro</Link>
        </div>

        {/* Column 3: Support */}
        <div className="flex flex-col gap-4">
          <h4 className="text-zk-yellow font-bold text-lg mb-2">SUPPORT</h4>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Help Center</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Contact Us</a>
          <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Privacy Policy</Link>
          <Link href="/terms" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Terms of Service</Link>
        </div>

        {/* Column 4: Follow Us */}
        <div className="flex flex-col gap-4">
          <h4 className="text-zk-yellow font-bold text-lg mb-2">FOLLOW US</h4>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="bg-white text-black p-2 hover:bg-gray-200 transition-colors flex items-center justify-center"
              aria-label="Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="#"
              className="bg-white text-black p-2 hover:bg-gray-200 transition-colors flex items-center justify-center"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="#"
              className="bg-white text-black p-2 hover:bg-gray-200 transition-colors flex items-center justify-center"
              aria-label="TikTok"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex justify-center py-6">
        <FooterLottie />
      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        Copyright © 2026, Zamba All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;