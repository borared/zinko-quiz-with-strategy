"use client";
import dynamic from 'next/dynamic';

const ChoosingSkill = dynamic(() => import('@/page/PinJoiningGate/ChoosingSkill'), { ssr: false });

export default function Page() {
  return <ChoosingSkill />;
}
