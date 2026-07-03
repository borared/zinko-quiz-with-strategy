'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import footerLottieData from '@/lib/footer-lottie.json';

const Lottie = dynamic(() => import('lottie-react').then((mod) => mod.default), { ssr: false });

export default function FooterLottie({ className = '' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`flex items-center justify-center w-40 h-40 shrink-0 ${className}`}
      aria-hidden
    >
      {mounted ? (
        <Lottie
          animationData={footerLottieData}
          loop
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <div className="w-full h-full rounded-full border-2 border-dashed border-zk-yellow/30 animate-pulse" />
      )}
    </div>
  );
}