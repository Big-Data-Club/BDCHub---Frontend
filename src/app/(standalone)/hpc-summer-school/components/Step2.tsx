import React, { useState, useRef, useEffect } from "react";
import { FormData, Errors, Translation } from "../types";
import { FL, FIn, FSel } from "./FormFields";
import universitiesData from "../universities.json";

interface Step2Props {
  t: Translation;
  data: FormData;
  errors: Errors;
  onChange: (f: keyof FormData, v: string) => void;
}

export function Step2({ t, data, errors, onChange }: Step2Props) {
  const isVi = t.langToggle === "English";

  const uniOptions = universitiesData.map(uni => ({
    value: uni.value,
    label: isVi ? uni.labelVi : uni.labelEn,
    keywords: [
      uni.labelVi,
      uni.labelEn,
      uni.abbr,
      uni.fullNameVi,
      uni.value
    ].filter(Boolean) as string[]
  }));

  // If university has a value and it is not one of the predefined ones, it is custom (Other)
  const isPredefined = data.university === "" || universitiesData.some(
    uni => (uni.labelVi === data.university || uni.labelEn === data.university) && uni.value !== "Other"
  );
  const [showOtherInput, setShowOtherInput] = useState(!isPredefined);
  const [isOpenScale, setIsOpenScale] = useState(false);
  const scaleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (scaleRef.current && !scaleRef.current.contains(event.target as Node)) {
        setIsOpenScale(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownChange = (val: string) => {
    if (val === "Other") {
      setShowOtherInput(true);
      onChange("university", "");
    } else if (val === "") {
      setShowOtherInput(false);
      onChange("university", "");
    } else {
      const option = uniOptions.find(o => o.value === val);
      if (option) {
        setShowOtherInput(false);
        onChange("university", option.label);
      } else {
        // Custom value from "Search & Auto-fill"
        setShowOtherInput(true);
        onChange("university", val);
      }
    }
  };

  const currentDropdownValue = (() => {
    if (showOtherInput) return "Other";
    if (!data.university) return "";
    const found = universitiesData.find(
      uni => (uni.labelVi === data.university || uni.labelEn === data.university) && uni.value !== "Other"
    );
    return found ? found.value : "";
  })();

  // Split data.gpa (e.g. "3.52/4.0" -> numeric: "3.52", scale: "/4.0")
  const [gpaNumeric, gpaScale] = (() => {
    const val = data.gpa || "";
    const index = val.indexOf("/");
    if (index !== -1) {
      return [val.slice(0, index).trim(), val.slice(index).trim()];
    }
    return [val.trim(), "/4.0"];
  })();

  const handleGpaNumericChange = (valStr: string) => {
    // Strip out any manually typed slashes or scales
    let numVal = valStr.replace(/\/.*/g, "").trim();
    onChange("gpa", `${numVal}${gpaScale}`);
  };

  const handleGpaScaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scaleStr = e.target.value;
    if (scaleStr === "Other") {
      onChange("gpa", `${gpaNumeric}/`);
    } else {
      onChange("gpa", `${gpaNumeric}${scaleStr}`);
    }
  };

  const handleGpaBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().replace(/\/.*/g, "");
    if (!val) return;

    // Convert comma to dot (e.g. "3,5" -> "3.5")
    let formatted = val.replace(",", ".");

    // If it's a pure integer (e.g. "3" -> "3.0")
    if (/^\d+$/.test(formatted)) {
      formatted = `${formatted}.0`;
    } 
    // If it ends with a dot (e.g. "3." -> "3.0")
    else if (/^\d+\.$/.test(formatted)) {
      formatted = `${formatted}0`;
    }
    // If it starts with a dot (e.g. ".5" -> "0.5")
    else if (/^\.\d+$/.test(formatted)) {
      formatted = `0${formatted}`;
    }

    if (formatted !== gpaNumeric) {
      onChange("gpa", `${formatted}${gpaScale}`);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-0.5">{t.step2Title}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t.step2Desc}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><FL req>{t.fullName}</FL><FIn type="text" placeholder={t.fullNamePh} value={data.fullName} onChange={e => onChange("fullName", e.target.value)} error={errors.fullName} /></div>
        <div><FL>{t.dob}</FL><FIn type="date" value={data.dob} onChange={e => onChange("dob", e.target.value)} /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><FL req>{t.studentId}</FL><FIn type="text" placeholder={t.studentIdPh} value={data.studentId} onChange={e => onChange("studentId", e.target.value)} error={errors.studentId} /></div>
        <div><FL req>{t.phone}</FL><FIn type="tel" placeholder={t.phonePh} value={data.phone} onChange={e => onChange("phone", e.target.value)} error={errors.phone} /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><FL req>{t.emailUni}</FL><FIn type="email" placeholder={t.emailUniPh} value={data.emailUni} onChange={e => onChange("emailUni", e.target.value)} error={errors.emailUni} /></div>
        <div><FL>{t.emailPersonal}</FL><FIn type="email" placeholder={t.emailPersonalPh} value={data.emailPersonal} onChange={e => onChange("emailPersonal", e.target.value)} /></div>
      </div>
      <div>
        <FL req>{t.university}</FL>
        <div className={`relative transition-all duration-300 space-y-3.5 ${
          showOtherInput
            ? "pl-4.5 border-l-2 border-cyan-500/60 dark:border-cyan-500/40"
            : "pl-0 border-l-0 border-transparent"
        }`}>
          <FSel
            value={currentDropdownValue}
            onChange={handleDropdownChange}
            options={uniOptions}
            placeholder={isVi ? "-- Chọn trường học --" : "-- Select University --"}
            error={showOtherInput ? undefined : errors.university}
            searchable={true}
            isVi={isVi}
          />
          {showOtherInput && (
            <div className="animate-fadeIn">
              <FL req>{isVi ? "Nhập tên trường khác" : "Specify your university"}</FL>
              <FIn
                type="text"
                placeholder={isVi ? "Ví dụ: Trường Đại học Bách khoa, ĐHQG TP.HCM" : "e.g. HCMC University of Technology"}
                value={data.university}
                onChange={e => onChange("university", e.target.value)}
                error={errors.university}
              />
            </div>
          )}
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1"><FL req>{t.major}</FL><FIn type="text" placeholder={t.majorPh} value={data.major} onChange={e => onChange("major", e.target.value)} error={errors.major} /></div>
        <div>
          <FL req>{t.yearOfStudy}</FL>
          <FSel
            value={data.year}
            onChange={v => onChange("year", v)}
            options={t.years.map(y => ({ value: y, label: y }))}
            placeholder={t.yearPh}
            error={errors.year}
            isVi={isVi}
          />
        </div>
        <div>
          <FL req>{t.gpa}</FL>
          <FIn
            type="text"
            placeholder={isVi ? "Ví dụ: 3.52" : "e.g. 3.52"}
            value={gpaNumeric}
            onChange={e => handleGpaNumericChange(e.target.value)}
            onBlur={handleGpaBlur}
            error={errors.gpa}
            suffix={
              (() => {
                const isCustomScale = gpaScale !== "/4.0" && gpaScale !== "/10.0";
                if (isCustomScale) {
                  return (
                    <div className="flex items-center gap-2 animate-gpa-fade">
                      {/* Vertical Divider */}
                      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/60 mr-0.5" />
                      {/* Small Custom Scale Input */}
                      <input
                        type="text"
                        placeholder="xx.xx"
                        value={gpaScale.replace("/", "")}
                        onChange={e => {
                          let val = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
                          onChange("gpa", `${gpaNumeric}/${val}`);
                        }}
                        className="w-12 text-center bg-transparent border-t-0 border-x-0 border-b border-dashed border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-slate-100 placeholder:text-slate-400/60 dark:placeholder:text-slate-600/60 outline-none focus:border-solid focus:border-cyan-500 focus:ring-0 transition-all p-0 pb-0.5"
                      />
                      {/* Close button to reset */}
                      <button
                        type="button"
                        onClick={() => onChange("gpa", `${gpaNumeric}/4.0`)}
                        className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5 active:scale-90"
                        title={isVi ? "Quay lại thang điểm chuẩn" : "Back to standard scales"}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                }
                return (
                  <div ref={scaleRef} className={`relative flex items-center gap-2 animate-gpa-fade ${isOpenScale ? "z-30" : ""}`}>
                    {/* Vertical Divider */}
                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/60" />
                    {/* Custom Dropdown Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsOpenScale(!isOpenScale)}
                      className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-black outline-none cursor-pointer hover:text-cyan-500 dark:hover:text-cyan-400 transition-all py-1 pl-1 pr-1.5 rounded-lg active:scale-95"
                    >
                      <span>{gpaScale === "/4.0" ? "4.0" : "10.0"}</span>
                      <svg
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpenScale ? "rotate-180 text-cyan-500" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {/* Dropdown Menu Popover */}
                    {isOpenScale && (
                      <ul className="absolute right-0 top-full z-50 mt-2 py-1 w-28 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/85 overflow-hidden animate-dropdown-fade-in">
                        {[
                          { value: "/4.0", label: "4.0" },
                          { value: "/10.0", label: "10.0" },
                          { value: "Other", label: isVi ? "Khác..." : "Other..." },
                        ].map(opt => {
                          const isSelected = opt.value === gpaScale;
                          return (
                            <li
                              key={opt.value}
                              onClick={() => {
                                if (opt.value === "Other") {
                                  onChange("gpa", `${gpaNumeric}/`);
                                } else {
                                  onChange("gpa", `${gpaNumeric}${opt.value}`);
                                }
                                setIsOpenScale(false);
                              }}
                              className={`px-3 py-2 text-xs font-bold cursor-pointer transition-all duration-200 flex items-center justify-between ${
                                isSelected
                                  ? "bg-gradient-to-r from-cyan-50/50 to-blue-50/30 dark:from-cyan-500/10 dark:to-blue-500/5 text-cyan-600 dark:text-cyan-400"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-white"
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isSelected && (
                                <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })()
            }
          />
        </div>
      </div>
      <style>{`
        @keyframes gpaFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateX(4px);
            filter: blur(0.5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateX(0);
            filter: blur(0);
          }
        }
        .animate-gpa-fade {
          animation: gpaFadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
