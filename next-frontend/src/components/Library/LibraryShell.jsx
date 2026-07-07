"use client";

import React, { useEffect } from 'react';
import LibrarySidebar from '@/components/Library/LibrarySidebar';
import MobileLibraryNav from '@/components/Library/MobileLibraryNav';
import { useLibraryCartStore } from '@/store/useLibraryCartStore';

export default function LibraryShell({ children, maxWidth = 'max-w-7xl' }) {
  const hydrateCart = useLibraryCartStore((s) => s.hydrateCart);

  useEffect(() => {
    hydrateCart();
  }, [hydrateCart]);

  return (
    <div className="min-h-[calc(100vh-76px)] font-sans relative">
      <div className="fixed inset-0 top-[76px] z-0 zk-workspace-bg" aria-hidden="true" />

      <div className="relative z-10 flex min-h-[calc(100vh-76px)]">
        <LibrarySidebar />
        <div className="flex-1 w-full min-w-0 p-5 md:p-8 md:ml-64 pb-24 md:pb-8">
          <div className={`${maxWidth} mx-auto flex flex-col gap-6 md:gap-8`}>
            {children}
          </div>
        </div>
      </div>

      <MobileLibraryNav />
    </div>
  );
}