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
    <>
      <style>{`
        @keyframes themeSlideUp {
          0% {
            transform: translateY(18px);
            opacity: 0;
            filter: blur(1.5px);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
            filter: blur(0);
          }
        }
        .animate-theme-slide {
          animation: themeSlideUp 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={`p-2 rounded-xl
                   text-slate-500 dark:text-slate-400
                   hover:bg-slate-100 dark:hover:bg-[#162644]
                   hover:text-slate-700 dark:hover:text-slate-200
                   active:scale-95 transition-all duration-200
                   relative overflow-hidden flex items-center justify-center
                   ${className}`}
        aria-label="Toggle theme"
      >
        <span key={theme} className="inline-flex animate-theme-slide">
          {theme === "dark" ? <Sun size={size} /> : <Moon size={size} />}
        </span>
      </button>
    </>
  );
}
