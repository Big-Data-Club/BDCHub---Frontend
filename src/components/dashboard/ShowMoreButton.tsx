"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ShowMoreButtonProps {
  onClick: () => void;
  remaining: number;
  variant: "announcement" | "event";
  customText?: string;
}

const LABELS = {
  announcement: "thông báo",
  event: "sự kiện",
};

export function ShowMoreButton({ onClick, remaining, variant, customText }: ShowMoreButtonProps) {
  const label = customText ?? `Xem thêm ${remaining} ${LABELS[variant]}`;

  return (
    <div className="flex justify-center mt-8">
      <Button
        onClick={onClick}
        variant="outline"
        className="border border-slate-300 dark:border-slate-700
                   text-slate-700 dark:text-slate-300
                   hover:bg-slate-50 dark:hover:bg-slate-800
                   hover:border-slate-400 dark:hover:border-slate-600
                   font-semibold px-6 py-2.5 rounded-xl shadow-sm
                   transition-all duration-200 active:scale-95 group"
      >
        {label}
        <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform duration-200" />
      </Button>
    </div>
  );
}