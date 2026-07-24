"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LIBRARY_MENU_ITEMS } from './libraryNav';
import { useLibraryCartStore } from '@/store/useLibraryCartStore';

export default function MobileLibraryNav() {
  const router = useRouter();
  const pathname = usePathname();
  const cartAlertCount = useLibraryCartStore((s) => s.cartAlertCount);
  const cartAlertPending = useLibraryCartStore((s) => s.cartAlertPending);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zk-purple border-t-[3px] border-zk-black px-2 py-2 safe-area-pb"
      aria-label="Library navigation"
    >
      <div className="flex items-center justify-around gap-1">
        {LIBRARY_MENU_ITEMS.map((item) => {
          const isActive =
            item.path === '/library'
              ? pathname === '/library'
              : pathname === item.path || pathname.startsWith(`${item.path}/`);
          const Icon = item.icon;
          const showBadge = item.id === 'cart' && cartAlertPending && cartAlertCount > 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => router.push(item.path)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-0 flex-1 ${
                isActive
                  ? 'bg-zk-purple-light border-[2px] border-zk-black shadow-[1px_1px_0_0_#000] text-white'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wide truncate w-full text-center">
                {item.shortName}
              </span>
              {showBadge && (
                <span className="absolute top-0 right-2 min-w-[1rem] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full border border-zk-black flex items-center justify-center">
                  {cartAlertCount > 9 ? '9+' : cartAlertCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}