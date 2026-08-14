"use client";

import React, { ReactNode } from "react";
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterDropdownOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: FilterDropdownOption[];
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
}

export function FilterDropdown({
  value,
  onValueChange,
  options,
  placeholder,
  icon,
  className,
}: FilterDropdownProps) {
  return (
    <div className={cn("w-full", className)}>
      <RadixSelect value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full h-[42px] bg-slate-50 dark:bg-[#0D192E] border border-slate-200 dark:border-blue-500/15 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 transition-all rounded-xl text-sm font-medium">
          <div className="flex items-center gap-2 truncate">
            {icon && <span className="text-slate-400 dark:text-slate-500 flex-shrink-0">{icon}</span>}
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-[#0F1E35] border-slate-200 dark:border-blue-500/15 shadow-xl rounded-xl">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 focus:bg-blue-50 dark:focus:bg-blue-950/60 focus:text-blue-600 dark:focus:text-cyan-400 cursor-pointer rounded-lg my-0.5"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </RadixSelect>
    </div>
  );
}
