"use client";

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SocialPage from '@/page/Social/SocialPage';
import FunLoadingScreen from '@/components/global/FunLoadingScreen';

function SocialFallback() {
  return <FunLoadingScreen />;
}

export default function Page() {
  return (
    <Suspense fallback={<SocialFallback />}>
      <SocialPage />
    </Suspense>
  );
}
