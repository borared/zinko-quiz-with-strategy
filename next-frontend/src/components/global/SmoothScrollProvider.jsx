"use client";
import React, { useEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';

export default function SmoothScrollProvider({ children }) {
  const pathname = usePathname();
  
  // We may not want smooth scrolling on game/play screens, but it's great for landing, dashboard, host lobby, etc.
  // The ReactLenis component handles RAF automatically internally.
  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true, syncTouch: false }}>
      {children}
    </ReactLenis>
  );
}
