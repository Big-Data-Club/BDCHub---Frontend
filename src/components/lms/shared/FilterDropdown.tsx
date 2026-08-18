"use client";

import React, { ReactNode } from "react";
import { Select, SelectOption } from "./Select";

export type FilterDropdownOption = SelectOption;

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
    <Select
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={placeholder}
      icon={icon}
      className={className}
      triggerClassName="h-[42px] border-slate-200 dark:border-blue-500/15"
    />
  );
}

