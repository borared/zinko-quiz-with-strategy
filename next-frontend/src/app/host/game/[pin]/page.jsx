"use client";
import dynamic from 'next/dynamic';

const HostGame = dynamic(() => import('@/page/Host/HostGame'), { ssr: false });

export default function Page() {
  return <HostGame />;
}
