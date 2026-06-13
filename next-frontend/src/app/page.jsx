"use client";
import { useEffect } from 'react';
import Hero from '@/page/landing/Hero';
import Engagement from '@/page/landing/Engagement';
import WhyZinko from '@/page/landing/WhyZinko';
import Ready from '@/page/landing/Ready';
import { useSocket } from '@/context/SocketContext';

export default function LandingPage() {
  const { disconnectSocket } = useSocket();

  useEffect(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  return (
    <>
      <Hero />
      <Engagement />
      <WhyZinko />
      <Ready />
    </>
  );
}
