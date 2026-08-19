"use client";

import { forwardRef, useEffect, useRef, useState, useImperativeHandle } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  value?: string;
  defaultValue?: string;
  onSearch?: (value: string) => void;
  onChange?: (value: string) => void;
  debounceMs?: number;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "transparent";
  shortcutHint?: string;
  onClear?: () => void;
  rightAction?: React.ReactNode;
  containerClassName?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      containerClassName,
      value: controlledValue,
      defaultValue = "",
      onSearch,
      onChange,
      debounceMs = 0,
      loading = false,
      size = "md",
      variant = "default",
      shortcutHint,
      onClear,
      rightAction,
      placeholder = "Tìm kiếm...",
      ...props
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const value = isControlled ? controlledValue : internalValue;
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // Debounce callback trigger when onSearch is supplied and debounceMs > 0
    useEffect(() => {
      if (!onSearch || debounceMs <= 0) return;
      const timer = setTimeout(() => {
        onSearch(value);
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [value, onSearch, debounceMs]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      if (!isControlled) setInternalValue(newVal);
      onChange?.(newVal);
      if (onSearch && debounceMs <= 0) {
        onSearch(newVal);
      }
    };

    const handleClear = () => {
      if (!isControlled) setInternalValue("");
      onChange?.("");
      onSearch?.("");
      onClear?.();
      inputRef.current?.focus();
    };

    const sizeClasses = {
      sm: "h-9 pl-8 pr-8 text-xs rounded-xl",
      md: "h-11 pl-10 pr-9 text-sm rounded-xl",
      lg: "h-12 pl-11 pr-10 text-base rounded-2xl",
    };

    const variantClasses = {
      default: "bg-slate-50 dark:bg-lms-input border border-slate-300 dark:border-blue-500/20 focus:bg-white dark:focus:bg-[#0A1628]",
      transparent: "bg-transparent border border-slate-200 dark:border-blue-500/15 focus:bg-white/40 dark:focus:bg-[#0A1628]/60 backdrop-blur-xs",
    };

    const iconSizes = {
      sm: "w-3.5 h-3.5 left-2.5",
      md: "w-4 h-4 left-3.5",
      lg: "w-5 h-5 left-4",
    };

    return (
      <div className={cn("relative flex items-center w-full gap-2", containerClassName)}>
        <div className="relative flex-1 flex items-center">
          {/* Search Icon / Loading Spinner */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center transition-colors z-10",
              iconSizes[size]
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin w-full h-full text-blue-500" />
            ) : (
              <Search className="w-full h-full" />
            )}
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              "w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all duration-200",
              sizeClasses[size],
              variantClasses[variant],
              value && "pr-8",
              className
            )}
            {...props}
          />

          {/* Clear Button / Shortcut Hint */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
            {value ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              shortcutHint && (
                <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-800/80 rounded border border-slate-300/50 dark:border-slate-700/50 select-none pointer-events-none">
                  {shortcutHint}
                </kbd>
              )
            )}
          </div>
        </div>

        {/* Optional Right Action (Buttons/Filters) */}
        {rightAction}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
