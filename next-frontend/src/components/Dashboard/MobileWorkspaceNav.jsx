"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WORKSPACE_MENU_ITEMS } from './workspaceNav';

const MobileWorkspaceNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zk-purple border-t-[3px] border-zk-border px-2 py-2 safe-area-pb"
      aria-label="Workspace navigation"
    >
      <div className="flex items-center justify-around gap-1">
        {WORKSPACE_MENU_ITEMS.map((item) => {
          const isActive =
            pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`));
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => router.push(item.path)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-0 flex-1 ${
                isActive
                  ? 'bg-zk-purple-light border-[2px] border-zk-border shadow-[1px_1px_0_0_#000] text-white'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wide truncate w-full text-center">
                {item.shortName}
              </span>
              {item.comingSoon && (
                <span className="absolute -top-1 right-1 w-1.5 h-1.5 bg-zk-bg rounded-full border border-zk-border" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileWorkspaceNav;