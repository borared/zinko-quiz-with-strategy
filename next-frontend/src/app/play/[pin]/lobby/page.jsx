"use client";
import dynamic from 'next/dynamic';

const PlayerLobby = dynamic(() => import('@/page/Play/PlayerLobby'), { ssr: false });

export default function Page() {
  return <PlayerLobby />;
}
