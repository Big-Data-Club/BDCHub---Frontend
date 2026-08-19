"use client";

import React, { forwardRef, ReactNode, useState, useMemo } from "react";
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: ReactNode;
  description?: string;
}

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "default" | "subtle" | "ghost";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange" | "size"> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options?: SelectOption[];
  icon?: ReactNode;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Backward compatibility for native select event */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  triggerClassName?: string;
  contentClassName?: string;
  containerClassName?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  required?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Force using native <select> even when options array is passed */
  native?: boolean;
}

const sizeClasses: Record<SelectSize, { trigger: string; icon: string; text: string }> = {
  sm: {
    trigger: "h-8 px-2.5 rounded-lg text-xs gap-1.5",
    icon: "h-3.5 w-3.5",
    text: "text-xs",
  },
  md: {
    trigger: "h-10 px-3.5 rounded-xl text-sm gap-2",
    icon: "h-4 w-4",
    text: "text-sm",
  },
  lg: {
    trigger: "h-12 px-4 rounded-xl text-base gap-2.5",
    icon: "h-5 w-5",
    text: "text-base",
  },
};

const variantClasses: Record<SelectVariant, string> = {
  default:
    "bg-slate-50 dark:bg-[#0D192E] border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#0A1628] focus:border-blue-500 dark:focus:border-cyan-400/50 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20",
  subtle:
    "bg-transparent border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 focus:border-blue-500 dark:focus:border-cyan-400/50 focus:ring-2 focus:ring-blue-500/20",
  ghost:
    "bg-transparent border-transparent text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:bg-slate-100 dark:focus:bg-slate-800",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      triggerClassName,
      contentClassName,
      containerClassName,
      children,
      label,
      hint,
      error,
      options,
      icon,
      placeholder = "Chọn một tùy chọn...",
      value,
      defaultValue,
      onValueChange,
      onChange,
      disabled,
      size = "md",
      variant = "default",
      required,
      clearable = false,
      onClear,
      searchable = false,
      searchPlaceholder = "Tìm kiếm...",
      native = false,
      ...props
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = useState("");

    // Bridge Radix value change to both onValueChange and synthetic HTMLSelectElement event
    const handleValueChange = (val: string) => {
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

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (onClear) {
        onClear();
      } else {
        handleValueChange("");
      }
    };

    // Filter options if searchable is enabled
    const filteredOptions = useMemo(() => {
      if (!options) return [];
      if (!searchable || !searchQuery.trim()) return options;
      const q = searchQuery.toLowerCase();
      return options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(q) ||
          opt.value.toLowerCase().includes(q) ||
          (opt.description && opt.description.toLowerCase().includes(q))
      );
    }, [options, searchable, searchQuery]);

    // Group options if group key is present
    const groupedOptions = useMemo(() => {
      if (!filteredOptions.length) return null;
      const hasGroups = filteredOptions.some((opt) => Boolean(opt.group));
      if (!hasGroups) return null;

      const groups: Record<string, SelectOption[]> = {};
      filteredOptions.forEach((opt) => {
        const gName = opt.group || "Khác";
        if (!groups[gName]) groups[gName] = [];
        groups[gName].push(opt);
      });
      return groups;
    }, [filteredOptions]);

    const isRadix = !native && (Boolean(options || onValueChange) || !children);
    const sizeStyle = sizeClasses[size];

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <span>{label}</span>
            {required && <span className="text-red-500">*</span>}
          </label>
        )}

        {isRadix ? (
          <RadixSelect
            value={value !== undefined ? String(value) : undefined}
            defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
            onValueChange={handleValueChange}
            disabled={disabled}
          >
            <div className="relative w-full">
              <SelectTrigger
                className={cn(
                  "w-full transition-all font-medium border shadow-xs",
                  sizeStyle.trigger,
                  variantClasses[variant],
                  error &&
                    "border-red-500 dark:border-red-500/60 focus:ring-red-500/20 dark:focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-500",
                  triggerClassName
                )}
              >
                <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                  {icon && (
                    <span className={cn("text-slate-400 dark:text-slate-500 shrink-0", sizeStyle.icon)}>
                      {icon}
                    </span>
                  )}
                  <SelectValue placeholder={placeholder} />
                </div>
              </SelectTrigger>

              {clearable && value && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear selection"
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-full"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <SelectContent
              onPointerDownOutside={(e) => {
                // Prevent Radix from calling preventDefault on the event so clicking Select B opens Select B in 1 click
                const target = e.target as HTMLElement | null;
                if (target && target.closest('[role="combobox"], [data-radix-select-trigger], button, input, select, a')) {
                  e.preventDefault();
                }
              }}
              className={cn(
                "bg-white dark:bg-[#0F1E35] border-slate-200 dark:border-blue-500/20 shadow-xl rounded-xl p-1",
                contentClassName
              )}
            >
              {searchable && (
                <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full bg-slate-100 dark:bg-slate-800/60 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {groupedOptions ? (
                Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
                  <SelectGroup key={groupName}>
                    <SelectLabel className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 px-2 py-1">
                      {groupName}
                    </SelectLabel>
                    {groupOpts.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.disabled}
                        className="text-xs font-medium text-slate-700 dark:text-slate-200 focus:bg-blue-50 dark:focus:bg-blue-950/60 focus:text-blue-700 dark:focus:text-cyan-300 cursor-pointer rounded-lg my-0.5"
                      >
                        <div className="flex items-center gap-2">
                          {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                          <div className="flex flex-col">
                            <span>{opt.label}</span>
                            {opt.description && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                {opt.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="text-xs font-medium text-slate-700 dark:text-slate-200 focus:bg-blue-50 dark:focus:bg-blue-950/60 focus:text-blue-700 dark:focus:text-cyan-300 cursor-pointer rounded-lg my-0.5"
                  >
                    <div className="flex items-center gap-2">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                        {opt.description && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))
              ) : searchable ? (
                <div className="p-3 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Không tìm thấy kết quả
                </div>
              ) : null}
            </SelectContent>
          </RadixSelect>
        ) : (
          <select
            className={cn(
              "w-full transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none",
              sizeStyle.trigger,
              variantClasses[variant],
              error &&
                "border-red-500 dark:border-red-500/60 focus:ring-red-500/20 dark:focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-500",
              triggerClassName,
              className
            )}
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
        )}

        {error ? (
          <p className="text-xs text-red-500 dark:text-red-400 font-medium animate-in fade-in-50 duration-150">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";


