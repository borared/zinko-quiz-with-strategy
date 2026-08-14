"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
