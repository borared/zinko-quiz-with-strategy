"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
      return;
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }) {
  const pathname = usePathname();

  const isLobbyOrJoin = pathname?.includes('/choose-team') || 
                        pathname?.includes('/join-nickname') || 
                        /^\/play\/[^/]+\/?$/.test(pathname || '');
  const isGameRoute = (pathname?.startsWith('/host') || pathname?.startsWith('/play')) && !isLobbyOrJoin;

  return (
    <NextThemesProvider 
      {...props} 
      forcedTheme={isGameRoute ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
