"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface TruncatedTooltipProps {
  text: string;
  className?: string;
  children?: React.ReactNode;
}

export function TruncatedTooltip({ text, className, children }: TruncatedTooltipProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [open, setOpen] = useState(false);

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

  const handlePointerEnter = () => {
    checkTruncation();
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={open && isTruncated} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <p
            ref={textRef}
            className={cn("truncate", className)}
            onPointerEnter={handlePointerEnter}
          >
            {children || text}
          </p>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className={cn(
            "z-50 px-3 py-1.5 rounded-lg text-xs font-medium max-w-[340px] w-max whitespace-normal break-words",
            "bg-slate-900 text-white dark:bg-[#0D192E] dark:text-slate-100",
            "border border-slate-700 dark:border-blue-500/20 shadow-lg"
          )}
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
