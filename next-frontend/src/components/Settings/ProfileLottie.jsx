'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function ProfileLottie({ className = '' }) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/lottie/settings-profile.json')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch((error) => {
        console.error('Failed to load profile lottie:', error);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      aria-hidden
    >
      {animationData ? (
        <Lottie animationData={animationData} loop className="w-full h-full max-w-[220px] max-h-[220px]" />
      ) : (
        <div className="w-[180px] h-[180px] rounded-full border-[3px] border-dashed border-zk-border/20 animate-pulse" />
      )}
    </div>
  );
}