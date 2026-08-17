"use client";
import dynamic from 'next/dynamic';

const PlayerController = dynamic(() => import('@/page/Play/PlayerController'), { ssr: false });

export default function Page() {
  return <PlayerController />;
}
