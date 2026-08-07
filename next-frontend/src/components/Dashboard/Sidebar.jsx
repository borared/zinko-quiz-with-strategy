"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WORKSPACE_MENU_ITEMS } from './workspaceNav';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 bg-zk-purple border-r-[3px] border-zk-border flex-col h-[calc(100vh-76px)] fixed top-[76px] left-0 text-white z-40">
      <div className="p-6 border-b-[3px] border-zk-border">
        <h1 className="font-black text-3xl text-white uppercase tracking-tighter permanent-marker-regular">
          ZINKO
        </h1>
        <p className="text-xs font-bold uppercase tracking-wider text-white/70 mt-1">
          Manage & Create
        </p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2 mt-2">
        {WORKSPACE_MENU_ITEMS.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(`${item.path}/`);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center justify-between gap-3 p-3 font-bold text-sm cursor-pointer transition-all border-[2px] rounded-lg text-left ${
                isActive
                  ? 'bg-zk-purple-light border-zk-border shadow-[2px_2px_0_0_#000] text-white'
                  : 'border-transparent hover:bg-zk-panel-bg/10 text-white/90'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={20} strokeWidth={2.5} />
                {item.name}
              </span>
              {item.comingSoon && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-zk-bg text-zk-text px-1.5 py-0.5 rounded border border-zk-border">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t-[3px] border-zk-border/30">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 text-center">
          Battle-ready quizzes
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;