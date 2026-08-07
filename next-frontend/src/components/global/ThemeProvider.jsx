"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }) {
  const pathname = usePathname();
  const isGameRoute = pathname?.startsWith('/host') || pathname?.startsWith('/play');

  return (
    <NextThemesProvider 
      {...props} 
      forcedTheme={isGameRoute ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
