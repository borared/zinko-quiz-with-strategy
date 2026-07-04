"use client";

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Shop from '@/page/Shop/Shop';

function ShopFallback() {
  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center">
      <Loader2 className="animate-spin text-zk-black" size={32} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <Shop />
    </Suspense>
  );
}