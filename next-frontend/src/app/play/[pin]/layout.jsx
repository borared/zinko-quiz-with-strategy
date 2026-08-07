"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, AlertTriangle } from 'lucide-react';
import { useSocketStore } from '@/store/useSocketStore';

export default function PlayLayout({ children }) {
  const { getSocket } = useSocketStore();
  const router = useRouter();
  const [hostDisconnected, setHostDisconnected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gameAudio) {
      window.gameAudio.pause();
      window.gameAudio.currentTime = 0;
      window.gameAudio = null;
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onHostDisconnected = () => {
      setHostDisconnected(true);
    };

    socket.on('game:host-disconnected', onHostDisconnected);

    return () => {
      socket.off('game:host-disconnected', onHostDisconnected);
    };
  }, [getSocket]);

  const handleGoHome = () => {
    sessionStorage.clear();
    router.push('/');
  };

  return (
    <>
      {children}
      
      {hostDisconnected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-zk-panel-bg border-[4px] border-zk-border rounded-2xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col items-center p-8 max-w-sm w-full text-center space-y-6 transform animate-in zoom-in duration-200">
            <div className="bg-red-100 p-4 rounded-full border-2 border-red-500 shadow-sm">
              <AlertTriangle className="text-red-500 w-12 h-12" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-zk-text font-['Amatic_SC']">Host Disconnected</h2>
              <p className="text-gray-600 font-bold">
                The host has left the game. The session has been terminated.
              </p>
            </div>

            <button 
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 w-full bg-[#5D3FD3] hover:bg-[#4b33a8] text-white border-[3px] border-zk-border px-6 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-xl font-['Amatic_SC'] text-3xl font-bold transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none leading-none pt-4"
            >
              <Home size={28} className="-mt-1" />
              Home
            </button>
          </div>
        </div>
      )}
    </>
  );
}
