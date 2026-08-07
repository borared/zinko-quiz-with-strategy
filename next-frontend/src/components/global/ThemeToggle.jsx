"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ variant = 'icon', onClick }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    if (variant === 'menuItem') {
      return <div className="w-full h-11" />; // Placeholder for menu item
    }
    return <div className="w-10 h-10" />;
  }

  const handleToggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    if (onClick) onClick();
  };

  if (variant === 'menuItem') {
    return (
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zk-bg/30 border-b-[2px] border-zk-border font-bold text-zk-text text-sm transition-colors"
      >
        {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        Switch theme
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-xl border-[3px] border-zk-border dark:border-zk-border bg-zk-panel-bg dark:bg-zk-panel-bg transition-all text-zk-text dark:text-zk-text hover:opacity-90"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
