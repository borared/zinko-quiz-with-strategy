"use client";
import { useEffect } from 'react';
import Hero from '@/page/landing/Hero';
import TrustedBy from '@/components/landingSection/TrustedBy';
import Engagement from '@/page/landing/Engagement';
import SkillsFeature from '@/page/landing/SkillsFeature';
import WhyZinko from '@/page/landing/WhyZinko';
import PricingPanel from '@/page/PricingPanel/PricingPanel';
import Ready from '@/page/landing/Ready';
import { useSocketStore } from '@/store/useSocketStore';

export default function LandingPage() {
  const { disconnectSocket } = useSocketStore();

  useEffect(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  return (
    <>
      <Hero />
      <TrustedBy />
      <SkillsFeature />
      <Engagement />
      <WhyZinko />
      <PricingPanel />
      <Ready />
    </>
  );
}
