"use client";
import React from 'react';
import MobileWorkspaceNav from '@/components/Dashboard/MobileWorkspaceNav';

export default function WorkspaceShell({
  sidebar,
  children,
  variant = 'default',
  maxWidth = 'max-w-7xl',
  contentClassName = '',
  showMobileNav = true,
}) {
  return (
    <div className="min-h-[calc(100vh-76px)] font-sans relative">
      {variant === 'creator' ? (
        <div className="fixed inset-0 top-[76px] z-0" aria-hidden="true">
          <div className="absolute inset-0 zk-workspace-bg-creator" />
          <div className="absolute inset-0 bg-gradient-to-b from-zk-black/35 via-zk-black/10 to-zk-black/50" />
        </div>
      ) : (
        <div className="fixed inset-0 top-[76px] z-0 zk-workspace-bg" aria-hidden="true" />
      )}

      <div className="relative z-10 flex min-h-[calc(100vh-76px)]">
        {sidebar}
        <div
          className={`flex-1 w-full min-w-0 p-5 md:p-8 md:ml-64 ${
            showMobileNav ? 'pb-24 md:pb-8' : ''
          } ${contentClassName}`}
        >
          <div className={`${maxWidth} mx-auto flex flex-col gap-6 md:gap-8`}>
            {children}
          </div>
        </div>
      </div>

      {showMobileNav && <MobileWorkspaceNav />}
    </div>
  );
}