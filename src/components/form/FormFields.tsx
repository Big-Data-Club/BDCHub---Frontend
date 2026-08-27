import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InfoTooltip, triggerFieldTooltip } from "@/components/form/InfoTooltip";
import { cn } from "@/lib/utils";

export const inputCls =
  "w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 outline-none " +
  "bg-white dark:bg-[#070E1B] " +
  "border border-slate-200 dark:border-slate-800 " +
  "text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "focus:border-blue-600 dark:focus:border-blue-500 " +
  "focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20";

export const errInputCls = "border-rose-400 dark:border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-rose-500/30";

export interface FormLabelProps {
  children?: React.ReactNode;
  req?: boolean;
  tooltipText?: string;
  fieldKey?: string;
  className?: string;
}

export function FL({ children, req, tooltipText, fieldKey, className }: FormLabelProps) {
  let mainText: React.ReactNode = children;
  let isRequired = req;

  if (typeof children === "string") {
    if (children.endsWith("*")) {
      mainText = children.slice(0, -1).trim();
      isRequired = true;
    }
  }

  return (
    <Label
      className={cn(
        "block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 transition-colors duration-200 leading-normal",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5 flex-wrap">
        <span>
          {mainText}
          {isRequired && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </span>
        {tooltipText && fieldKey && (
          <InfoTooltip text={tooltipText} fieldKey={fieldKey} />
        )}
      </span>
    </Label>
  );
}

export function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1.5 animate-fadeIn">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <span>{msg}</span>
    </p>
  );
}

export interface FInProps extends React.ComponentProps<typeof Input> {
  label?: string | React.ReactNode;
  req?: boolean;
  error?: string;
  suffix?: React.ReactNode;
  tooltipText?: string;
  fieldKey?: string;
}

export function FIn({ label, req, error, suffix, tooltipText, fieldKey, onFocus, className, ...p }: FInProps) {
  const focusedRef = useRef(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (fieldKey && !focusedRef.current) {
      focusedRef.current = true;
      triggerFieldTooltip(fieldKey);
    }
    if (onFocus) onFocus(e);
  };

  return (
    <div className="relative w-full">
      {label && (
        <FL req={req} tooltipText={tooltipText} fieldKey={fieldKey}>
          {label}
        </FL>
      )}
      <div className="relative flex items-center">
        <Input
          {...p}
          onFocus={handleFocus}
          className={cn(
            inputCls,
            error ? errInputCls : "",
            suffix ? "pr-20" : "",
            className
          )}
        />
        {suffix && (
          <div className="absolute right-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none select-none">
            {suffix}
          </div>
        )}
      </div>
      <Err msg={error} />
    </div>
  );
}

export interface FTaProps extends React.ComponentProps<typeof Textarea> {
  label?: string | React.ReactNode;
  req?: boolean;
  error?: string;
  tooltipText?: string;
  fieldKey?: string;
}

export function FTa({ label, req, error, tooltipText, fieldKey, onFocus, rows = 4, className, ...p }: FTaProps) {
  const focusedRef = useRef(false);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (fieldKey && !focusedRef.current) {
      focusedRef.current = true;
      triggerFieldTooltip(fieldKey);
    }
    if (onFocus) onFocus(e);
  };

  return (
    <div className="relative w-full">
      {label && (
        <FL req={req} tooltipText={tooltipText} fieldKey={fieldKey}>
          {label}
        </FL>
      )}
      <Textarea
        rows={rows}
        {...p}
        onFocus={handleFocus}
        className={cn(inputCls, "resize-none", error ? errInputCls : "", className)}
      />
      <Err msg={error} />
    </div>
  );
}

export interface FCbProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FCb({ id, checked, onCheckedChange, label, description, error, icon, className }: FCbProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="flex items-start space-x-3 cursor-pointer select-none">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(c) => onCheckedChange(Boolean(c))}
          className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070E1B] data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 text-white focus-visible:ring-blue-500/20 cursor-pointer shrink-0"
        />
        <div className="space-y-0.5 min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 leading-snug">
            {icon}
            <span>{label}</span>
          </span>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>
      </label>
      <Err msg={error} />
    </div>
  );
}

export interface FSelProps {
  label?: string | React.ReactNode;
  req?: boolean;
  tooltipText?: string;
  fieldKey?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; keywords?: string[] }[];
  placeholder: string;
  error?: string;
  searchable?: boolean;
  isVi?: boolean;
}

export function FSel({
  label,
  req,
  tooltipText,
  fieldKey,
  value,
  onChange,
  options,
  placeholder,
  error,
  searchable = false,
  isVi = false,
}: FSelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((o) => o.value === value);
  const isCustomValue = Boolean(value && value !== "none" && !selectedOption);

  const removeAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = removeAccents(searchQuery.trim());
    return searchQuery.trim() === ""
      ? options
      : options.filter((o) => {
          const normLabel = removeAccents(o.label);
          const normValue = removeAccents(o.value);
          if (normLabel.includes(normalizedQuery) || normValue.includes(normalizedQuery)) {
            return true;
          }
          if (o.keywords) {
            return o.keywords.some((kw) => removeAccents(kw).includes(normalizedQuery));
          }
          return false;
        });
  }, [searchQuery, options]);

  const isQueryCustom =
    searchQuery.trim() !== "" &&
    !options.some(
      (o) =>
        removeAccents(o.label) === removeAccents(searchQuery.trim()) ||
        removeAccents(o.value) === removeAccents(searchQuery.trim())
    );

  return (
    <div ref={ref} className="relative w-full">
      {label && (
        <FL req={req} tooltipText={tooltipText} fieldKey={fieldKey}>
          {label}
        </FL>
      )}

      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputCls} relative flex items-center justify-between cursor-pointer border ${
          error
            ? errInputCls
            : isOpen
            ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-400/20"
            : isCustomValue
            ? "border-amber-300 dark:border-amber-700/60 bg-amber-50/30 dark:bg-amber-950/15"
            : ""
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-6 text-sm">
          {selectedOption ? (
            <span className="text-slate-900 dark:text-slate-100 font-semibold truncate">
              {selectedOption.label}
            </span>
          ) : isCustomValue ? (
            <>
              <span className="text-amber-950 dark:text-amber-100 font-semibold truncate">
                {value}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0 select-none">
                <svg className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                {isVi ? "Lựa chọn khác" : "Other"}
              </span>
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-medium truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 dark:text-slate-500">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-500" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      {/* Clean Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-dropdown-fade-in">
          {searchable && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isVi ? "Tìm hoặc nhập để bổ sung lựa chọn mới..." : "Type to search or enter custom..."}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          )}

          <ul className="max-h-52 overflow-y-auto py-1">
            {filteredOptions.length === 0 && !isQueryCustom ? (
              <li className="px-3.5 py-3 text-xs text-center text-slate-400 dark:text-slate-500 italic">
                {isVi ? "Không tìm thấy kết quả" : "No matching results"}
              </li>
            ) : (
              filteredOptions.map((o) => {
                const isSelected = o.value === value;
                return (
                  <li
                    key={o.value}
                    onClick={() => {
                      onChange(o.value);
                      setIsOpen(false);
                    }}
                    className={`px-3.5 py-2 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span>{o.label}</span>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </li>
                );
              })
            )}

            {isQueryCustom && (
              <li
                onClick={() => {
                  onChange(searchQuery.trim());
                  setIsOpen(false);
                }}
                className="px-3.5 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>{isVi ? `Thêm mới: "${searchQuery.trim()}"` : `Add: "${searchQuery.trim()}"`}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      <Err msg={error} />
    </div>
  );
}

