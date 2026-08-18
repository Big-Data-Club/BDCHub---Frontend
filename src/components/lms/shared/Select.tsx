"use client";

import React, { forwardRef, ReactNode } from "react";
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  icon?: ReactNode;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  // Backward compatibility for native select event
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  triggerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      triggerClassName,
      children,
      label,
      error,
      options,
      icon,
      placeholder,
      value,
      onValueChange,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    // Handling value change bridge
    const handleRadixChange = (val: string) => {
      if (onValueChange) {
        onValueChange(val);
      }
      if (onChange) {
        const syntheticEvent = {
          target: { value: val, name: props.name },
          currentTarget: { value: val, name: props.name },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    };

    // If options or icon or onValueChange is specified without raw children, render Radix UI Select
    const isRadix = Boolean(options || icon || onValueChange) && !children;

    return (
      <div className={cn("w-full space-y-1.5", className)}>
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}

        {isRadix ? (
          <RadixSelect
            value={value !== undefined ? String(value) : undefined}
            onValueChange={handleRadixChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                "w-full h-10 bg-slate-50 dark:bg-[#0D192E] border border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all rounded-xl text-sm font-medium",
                error && "border-red-500 dark:border-red-500/50 focus:ring-red-500/20 dark:focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-500",
                triggerClassName
              )}
            >
              <div className="flex items-center gap-2 truncate">
                {icon && <span className="text-slate-400 dark:text-slate-500 shrink-0">{icon}</span>}
                <SelectValue placeholder={placeholder} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0F1E35] border-slate-200 dark:border-blue-500/20 shadow-xl rounded-xl">
              {options?.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-200 focus:bg-blue-50 dark:focus:bg-blue-950/60 focus:text-blue-700 dark:focus:text-cyan-300 cursor-pointer rounded-lg my-0.5"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </RadixSelect>
        ) : (
          <select
            className={cn(
              "w-full rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-[#0D192E] border border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#0A1628] focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-500 dark:border-red-500/50 focus:ring-red-500/20 dark:focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-500",
              triggerClassName
            )}
            ref={ref}
            value={value}
            onChange={onChange}
            disabled={disabled}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {children}
          </select>
        )}

        {error && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

