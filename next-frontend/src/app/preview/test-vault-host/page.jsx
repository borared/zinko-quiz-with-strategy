"use client";
import React, { useState, useEffect } from 'react';
import VaultBreakerHost from '@/components/HostGame/VaultBreakerHost';

export default function TestVaultHostPage() {
  const [teamVaults, setTeamVaults] = useState({
    A: { required: ['RED', 'BLUE', 'GREEN'], cracked: 0 },
    B: { required: ['YELLOW', 'BLUE'], cracked: 1 }
  });

  const [heldColors, setHeldColors] = useState({
    A: ['RED'],
    B: ['YELLOW', 'BLUE']
  });

  // Cycle through some states to simulate gameplay
  useEffect(() => {
    const timer = setInterval(() => {
      setHeldColors(prev => {
        if (prev.A.includes('BLUE')) {
          return { A: ['RED'], B: ['YELLOW'] };
        } else {
          return { A: ['RED', 'BLUE', 'GREEN'], B: ['YELLOW', 'BLUE'] };
        }
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-screen font-sans bg-[#0D0D1A]">
      <VaultBreakerHost
        teamVaults={teamVaults}
        heldColors={heldColors}
        vaultsToWin={3}
        winner={null}
      />
    </div>
  );
}
