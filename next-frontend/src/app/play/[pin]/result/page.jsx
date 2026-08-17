"use client";
import dynamic from 'next/dynamic';

const PlayerResult = dynamic(() => import('@/page/Play/PlayerResult'), { ssr: false });

export default function Page() {
  return <PlayerResult />;
}
