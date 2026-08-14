"use client";

import React, { memo } from "react";

interface TerminalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const TerminalCard = memo(function TerminalCard({
  children,
  className = "",
  hoverEffect = true,
  ...props
}: TerminalCardProps) {
  const baseClasses =
    "bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/20 shadow-md dark:shadow-[0_4px_20px_rgba(7,14,28,0.4)] transition-all duration-300";
  const hoverClasses = hoverEffect
    ? "hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-[0_8px_30px_rgba(34,211,238,0.12)] hover:border-blue-400/60 dark:hover:border-cyan-400/40"
    : "";

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
});

export default TerminalCard;
