"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  /** Size of the icon in pixels */
  size?: number;
  /** Additional CSS classes for the button */
  className?: string;
}

export function ThemeToggle({ size = 18, className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`p-2 rounded-xl
                 text-slate-500 dark:text-slate-400
                 hover:bg-slate-100 dark:hover:bg-[#162644]
                 hover:text-slate-700 dark:hover:text-slate-200
                 active:scale-95 transition-all duration-200
                 ${className}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );
}
