"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TruncatedTooltipProps {
  text: string;
  className?: string;
  children?: React.ReactNode;
}

export function TruncatedTooltip({ text, className, children }: TruncatedTooltipProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const checkTruncation = () => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  };

  useEffect(() => {
    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [text]);

  return (
    <div
      className="relative flex-1 min-w-0"
      onMouseEnter={() => {
        checkTruncation();
        if (isTruncated) setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <p
        ref={textRef}
        className={cn("truncate", className)}
      >
        {children || text}
      </p>

      {showTooltip && isTruncated && (
        <div
          className={cn(
            "absolute left-0 bottom-full mb-1.5 z-50 px-2.5 py-1.5 rounded-lg text-xs font-medium max-w-xs",
            "bg-slate-900 text-white dark:bg-[#0D192E] dark:text-slate-100",
            "border border-slate-700 dark:border-blue-500/20 shadow-lg",
            "pointer-events-none whitespace-normal break-words animate-in fade-in zoom-in-95 duration-150",
          )}
        >
          {text}
        </div>
      )}
    </div>
  );
}
