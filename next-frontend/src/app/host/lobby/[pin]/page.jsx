"use client";
import dynamic from 'next/dynamic';

const HostLobby = dynamic(() => import('@/page/Host/HostLobby'), { ssr: false });

export default function Page() {
  return <HostLobby />;
}
