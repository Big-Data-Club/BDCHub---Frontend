import React, { useState, useRef, useEffect } from "react";

export const inputCls =
  "w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 outline-none " +
  "bg-slate-50/50 dark:bg-slate-800/40 " +
  "border border-slate-200 dark:border-slate-700/60 " +
  "text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "focus:border-cyan-500 dark:focus:border-cyan-400 " +
  "focus:ring-4 focus:ring-cyan-500/10 dark:focus:ring-cyan-400/10 " +
  "focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]";

export const errInputCls = "border-red-400 dark:border-red-500/70 bg-red-50/50 dark:bg-red-950/10";

export function FL({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors duration-200">
      {children}{req && <span className="text-cyan-600 dark:text-cyan-400 ml-1 font-bold animate-pulse">*</span>}
    </label>
  );
}

export function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-fadeIn">⚠ {msg}</p>;
}

export function FIn({ error, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div className="relative w-full">
      <input {...p} className={`${inputCls} ${error ? errInputCls : ""}`} />
      <Err msg={error} />
    </div>
  );
}

export function FTa({ error, rows = 4, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <div className="relative w-full">
      <textarea rows={rows} {...p} className={`${inputCls} resize-none ${error ? errInputCls : ""}`} />
      <Err msg={error} />
    </div>
  );
}

export function FSel({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputCls} flex items-center justify-between text-left cursor-pointer border ${
          error ? errInputCls : isOpen ? "border-cyan-500 dark:border-cyan-400 ring-4 ring-cyan-500/10 dark:ring-cyan-400/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]" : ""
        }`}
      >
        <span className={selectedOption ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-400 dark:placeholder:text-slate-500 font-semibold"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-cyan-500" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute left-0 right-0 z-50 mt-2 py-1.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/85 overflow-hidden animate-dropdown-fade-in max-h-60 overflow-y-auto">
          <li
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
              !value
                ? "bg-cyan-50/50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold"
                : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            {placeholder}
          </li>
          
          {options.map(o => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between font-semibold ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-50/50 to-blue-50/30 dark:from-cyan-500/10 dark:to-blue-500/5 text-cyan-600 dark:text-cyan-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <span>{o.label}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-cyan-500 animate-fadeIn" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
      
      <Err msg={error} />
    </div>
  );
}
