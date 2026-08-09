"use client";

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Shop from '@/page/Shop/Shop';
import FunLoadingScreen from '@/components/global/FunLoadingScreen';

function ShopFallback() {
  return <FunLoadingScreen />;
}

export default function Page() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <Shop />
    </Suspense>
  );
}