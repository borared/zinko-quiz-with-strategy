"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LIBRARY_MENU_ITEMS } from './libraryNav';
import { useLibraryCartStore } from '@/store/useLibraryCartStore';

export default function LibrarySidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const cartAlertCount = useLibraryCartStore((s) => s.cartAlertCount);
  const cartAlertPending = useLibraryCartStore((s) => s.cartAlertPending);

  return (
    <aside className="hidden md:flex w-64 bg-zk-purple border-r-[3px] border-zk-black flex-col h-[calc(100vh-76px)] fixed top-[76px] left-0 text-white z-40">
      <div className="p-6 border-b-[3px] border-zk-black">
        <h1 className="font-black text-3xl text-white uppercase tracking-tighter permanent-marker-regular">
          LIBRARY
        </h1>
        <p className="text-xs font-bold uppercase tracking-wider text-white/70 mt-1">
          Your collection & cart
        </p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2 mt-2">
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
              className={`w-full flex items-center justify-between gap-3 p-3 font-bold text-sm cursor-pointer transition-all border-[2px] rounded-lg text-left ${
                isActive
                  ? 'bg-zk-purple-light border-zk-black shadow-[2px_2px_0_0_#000] text-white'
                  : 'border-transparent hover:bg-white/10 text-white/90'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={20} strokeWidth={2.5} />
                {item.name}
              </span>
              {showBadge && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-red-500 text-white min-w-[1.25rem] h-5 px-1.5 rounded-full border border-zk-black flex items-center justify-center">
                  {cartAlertCount > 99 ? '99+' : cartAlertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t-[3px] border-zk-black/30">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 text-center">
          Scenery, avatars & more
        </p>
      </div>
    </aside>
  );
}