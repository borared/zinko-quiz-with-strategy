"use client";
import React from 'react';
import VaultBreakerPlayer from '@/components/Play/VaultBreakerPlayer';

export default function TestVaultPage() {
  return (
    <div className="w-full h-screen font-sans">
      <VaultBreakerPlayer 
        assignedColors={['RED', 'BLUE', 'GREEN', 'YELLOW']} 
        onHold={(color) => console.log('Holding color:', color)}
        onRelease={(color) => console.log('Released color:', color)}
      />
    </div>
  );
}
