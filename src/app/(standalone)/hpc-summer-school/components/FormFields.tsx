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

export function FIn({ error, suffix, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string; suffix?: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <input {...p} className={`${inputCls} ${error ? errInputCls : ""} ${suffix ? "pr-24" : ""}`} />
        {suffix && (
          <div className="absolute right-4 text-sm font-bold text-slate-400 dark:text-slate-500">
            {suffix}
          </div>
        )}
      </div>
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
  searchable = false,
  isVi = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; keywords?: string[] }[];
  placeholder: string;
  error?: string;
  searchable?: boolean;
  isVi?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value);

  const removeAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  const normalizedQuery = removeAccents(searchQuery.trim());

  const filteredOptions = searchQuery.trim() === ""
    ? options
    : options.filter(o => {
        const normLabel = removeAccents(o.label);
        const normValue = removeAccents(o.value);
        if (normLabel.includes(normalizedQuery) || normValue.includes(normalizedQuery)) {
          return true;
        }
        if (o.keywords) {
          return o.keywords.some(kw => removeAccents(kw).includes(normalizedQuery));
        }
        return false;
      });

  return (
    <div ref={ref} className={`relative w-full ${isOpen ? "z-30" : ""}`}>
      <style>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
            filter: blur(1px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        .animate-dropdown-fade-in {
          animation: dropdownFadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 200ms ease-out forwards;
        }
      `}</style>

      <div
        className={`${inputCls} relative flex items-center justify-between cursor-pointer border ${
          error ? errInputCls : isOpen ? "border-cyan-500 dark:border-cyan-400 ring-4 ring-cyan-500/10 dark:ring-cyan-400/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]" : ""
        }`}
        onClick={() => {
          if (!isOpen) setIsOpen(true);
        }}
      >
        {isOpen && searchable ? (
          <input
            type="text"
            autoFocus
            placeholder={selectedOption ? selectedOption.label : placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 pr-16"
          />
        ) : (
          <span className={selectedOption ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-400 dark:placeholder:text-slate-500 font-semibold"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        )}

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          {isOpen && searchable && searchQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery("");
              }}
              className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              if (isOpen) {
                e.stopPropagation();
                setIsOpen(false);
              }
            }}
            className={`transition-colors p-0.5 ${isOpen ? "text-cyan-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
          >
            <svg
              className={`w-4.5 h-4.5 transition-transform duration-300 ${isOpen ? "rotate-180 text-cyan-500" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <ul className="absolute left-0 right-0 z-50 mt-2 py-1.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/85 overflow-hidden animate-dropdown-fade-in max-h-60 overflow-y-auto">
          {!searchQuery && (
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
          )}
          
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-3 text-xs text-center text-slate-400 dark:text-slate-500 italic">
              {isVi ? "Không tìm thấy kết quả" : "No results found"}
            </li>
          ) : (
            filteredOptions.map(o => {
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
            })
          )}

          {searchQuery.trim() && !options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase()) && (
            <li
              onClick={() => {
                onChange(searchQuery.trim());
                setIsOpen(false);
              }}
              className="px-4 py-2.5 text-sm cursor-pointer transition-all duration-200 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold border-t border-slate-100 dark:border-slate-850/30 flex items-center gap-2"
            >
              <svg 
                className="w-4 h-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="flex-1 truncate">
                {isVi ? "Bổ sung" : "Add"}: &quot;{searchQuery.trim()}&quot;
              </span>
            </li>
          )}
        </ul>
      )}
      
      <Err msg={error} />
    </div>
  );
}
