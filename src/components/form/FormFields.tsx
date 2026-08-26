import React, { useState, useRef, useEffect } from "react";

export const inputCls =
  "w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 outline-none " +
  "bg-slate-50/70 dark:bg-slate-900/60 " +
  "border border-slate-200 dark:border-slate-800 " +
  "text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "focus:border-blue-600 dark:focus:border-blue-500 " +
  "focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20";

export const errInputCls = "border-rose-400 dark:border-rose-500/70 bg-rose-50/40 dark:bg-rose-950/20";

export function FL({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 transition-colors duration-200">
      {children}{req && <span className="text-rose-500 ml-1 font-bold">*</span>}
    </label>
  );
}

export function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-fadeIn">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <span>{msg}</span>
    </p>
  );
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
