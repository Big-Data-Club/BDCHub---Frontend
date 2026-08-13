"use client";

import React from "react";
import { BookOpen, Award, Sparkles, FileCheck } from "lucide-react";
import { FormData, Errors, T, Lang } from "../types";
import { FileUploadCloudinary } from "./FileUploadCloudinary";
import { FSel } from "@/components/form/FormFields";

interface Step2AcademicProps {
  form: FormData;
  onChange: (fields: Partial<FormData>) => void;
  errors: Errors;
  lang: Lang;
}

const inputBase =
  "w-full bg-white dark:bg-[#091124] border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-200";
const inputNormal =
  "border-slate-300 dark:border-slate-800 focus:bg-white dark:focus:bg-[#0A1628] focus:border-blue-500 dark:focus:border-cyan-400/50 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20";
const inputError =
  "border-rose-400 dark:border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-rose-500/30";

const renderLabel = (labelStr: string) => {
  if (labelStr.endsWith("*")) {
    const mainText = labelStr.slice(0, -1).trim();
    return (
      <>
        {mainText}
        <span className="text-rose-500 ml-1 font-bold">*</span>
      </>
    );
  }
  return labelStr;
};

interface GpaInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  isVi: boolean;
}

const GpaInput: React.FC<GpaInputProps> = ({ label, value, onChange, error, placeholder, isVi }) => {
  const [isOpenScale, setIsOpenScale] = React.useState(false);
  const scaleRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (scaleRef.current && !scaleRef.current.contains(event.target as Node)) {
        setIsOpenScale(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [gpaNumeric, gpaScale] = React.useMemo(() => {
    const val = value || "";
    const index = val.indexOf("/");
    if (index !== -1) {
      return [val.slice(0, index).trim(), val.slice(index).trim()];
    }
    return [val.trim(), "/4.0"];
  }, [value]);

  const handleGpaNumericChange = (valStr: string) => {
    const numVal = valStr.replace(/\/.*/g, "").trim();
    onChange(`${numVal}${gpaScale}`);
  };

  const handleGpaBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().replace(/\/.*/g, "");
    if (!val) return;

    let formatted = val.replace(",", ".");
    if (/^\d+$/.test(formatted)) {
      formatted = `${formatted}.0`;
    } else if (/^\d+\.$/.test(formatted)) {
      formatted = `${formatted}0`;
    } else if (/^\.\d+$/.test(formatted)) {
      formatted = `0${formatted}`;
    }

    if (formatted !== gpaNumeric) {
      onChange(`${formatted}${gpaScale}`);
    }
  };

  const isCustomScale = gpaScale !== "/4.0" && gpaScale !== "/10.0";

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
        {renderLabel(label)}
      </label>
      <div className="relative w-full">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder={placeholder}
            value={gpaNumeric}
            onChange={(e) => handleGpaNumericChange(e.target.value)}
            onBlur={handleGpaBlur}
            className={`${inputBase} ${error ? inputError : inputNormal} ${isCustomScale ? "pr-28" : "pr-24"}`}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {isCustomScale ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/60 mr-1" />
                <input
                  type="text"
                  placeholder="xx.xx"
                  value={gpaScale.replace("/", "")}
                  onChange={(e) => {
                    const val = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
                    onChange(`${gpaNumeric}/${val}`);
                  }}
                  className="w-10 text-center bg-transparent border-t-0 border-x-0 border-b border-dashed border-slate-350 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-slate-100 placeholder:text-slate-400/50 outline-none focus:border-solid focus:border-cyan-500 focus:ring-0 transition-all p-0 pb-0.5"
                />
                <button
                  type="button"
                  onClick={() => onChange(`${gpaNumeric}/4.0`)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-0.5 active:scale-90"
                  title={isVi ? "Quay lại thang điểm chuẩn" : "Back to standard scales"}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div ref={scaleRef} className={`relative flex items-center gap-1.5 ${isOpenScale ? "z-30" : ""}`}>
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/60 mr-0.5" />
                <button
                  type="button"
                  onClick={() => setIsOpenScale(!isOpenScale)}
                  className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400 text-xs font-black outline-none cursor-pointer hover:text-cyan-500 transition-all py-1 pl-1 pr-1.5 rounded-lg active:scale-95"
                >
                  <span>{gpaScale === "/4.0" ? "4.0" : "10.0"}</span>
                  <svg
                    className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isOpenScale ? "rotate-180 text-cyan-500" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {isOpenScale && (
                  <ul className="absolute right-0 top-full z-50 mt-2 py-1 w-24 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/85 dark:border-slate-800/85 shadow-2xl overflow-hidden animate-in fade-in duration-200">
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
                              onChange(`${gpaNumeric}/`);
                            } else {
                              onChange(`${gpaNumeric}${opt.value}`);
                            }
                            setIsOpenScale(false);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold cursor-pointer transition-all duration-200 flex items-center justify-between ${
                            isSelected
                              ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && (
                            <svg className="w-3 h-3 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
      </div>
    </div>
  );
};

export const Step2Academic: React.FC<Step2AcademicProps> = ({ form, onChange, errors, lang }) => {
  const t = T[lang];
  const isVi = lang === "vi";
  const isFreshman = form.academicStatus === "freshman";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-200/80 dark:border-blue-500/15 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-cyan-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          {t.step2Header}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{t.step2Desc}</p>
      </div>

      {/* Status Notice Banner */}
      {!isFreshman && (
        <div className="p-4.5 rounded-2xl border bg-blue-50/70 dark:bg-[#0F1E35] border-blue-200 dark:border-blue-500/20 flex items-start space-x-3.5 shadow-sm">
          <div className="p-2 bg-blue-100 dark:bg-cyan-500/10 rounded-xl text-blue-600 dark:text-cyan-400 shrink-0 border border-blue-200 dark:border-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {t.seniorNoticeTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {t.seniorNoticeDesc}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Academic Inputs */}
      {isFreshman ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {renderLabel(t.thptScore)}
              </label>
              <input
                type="text"
                value={form.thptScore || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({
                    thptScore: val,
                    thptDgnlScores: `THPT: ${val || "N/A"}${form.hasDgnl === "yes" && form.dgnlScore?.trim() ? ` | ĐGNL: ${form.dgnlScore}` : " | ĐGNL: Không"}`
                  });
                }}
                placeholder={t.thptScorePh}
                className={`${inputBase} ${errors.thptScore ? inputError : inputNormal}`}
              />
              {errors.thptScore && <p className="text-xs text-rose-500 mt-1">{errors.thptScore}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {renderLabel(t.dgnlScore)}
              </label>
              <div className="flex items-center gap-3">
                {/* Segemented control style radio buttons */}
                <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
                  {[
                    { value: "yes", label: isVi ? "Có" : "Yes" },
                    { value: "no", label: isVi ? "Không" : "No" }
                  ].map((opt) => {
                    const isSelected = form.hasDgnl === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => {
                          const scoreVal = opt.value === "yes" ? (form.dgnlScore || "") : "";
                          onChange({
                            hasDgnl: opt.value,
                            dgnlScore: scoreVal,
                            thptDgnlScores: `THPT: ${form.thptScore || "N/A"}${opt.value === "yes" && scoreVal.trim() ? ` | ĐGNL: ${scoreVal}` : " | ĐGNL: Không"}`
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          isSelected
                            ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    disabled={form.hasDgnl === "no"}
                    value={form.hasDgnl === "yes" ? (form.dgnlScore || "") : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange({
                        dgnlScore: val,
                        thptDgnlScores: `THPT: ${form.thptScore || "N/A"}${val.trim() ? ` | ĐGNL: ${val}` : ""}`
                      });
                    }}
                    placeholder={form.hasDgnl === "yes" ? t.dgnlScorePh : (isVi ? "Không thi" : "N/A")}
                    className={`${inputBase} ${
                      form.hasDgnl === "no"
                        ? "bg-slate-100/80 dark:bg-slate-950/40 text-slate-400/80 dark:text-slate-650 border-slate-200/50 dark:border-slate-800/30 cursor-not-allowed opacity-50"
                        : errors.dgnlScore ? inputError : inputNormal
                    }`}
                  />
                </div>
              </div>
              {form.hasDgnl === "yes" && errors.dgnlScore && <p className="text-xs text-rose-500 mt-1">{errors.dgnlScore}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {renderLabel(t.englishCertType)}
              </label>
              <FSel
                value={form.englishCertType || "none"}
                onChange={(val) => {
                  const nextScore = val === "none" ? "" : (form.englishCertScore || "");
                  onChange({
                    englishCertType: val,
                    englishCertScore: nextScore,
                    englishCert: val === "none" ? "Chưa có" : `${val.toUpperCase()}: ${nextScore}`
                  });
                }}
                options={[
                  { value: "none", label: isVi ? "Chưa có" : "None" },
                  { value: "ielts", label: "IELTS" },
                  { value: "toeic", label: "TOEIC" },
                  { value: "toefl", label: "TOEFL" },
                  { value: "vstep", label: "VSTEP" },
                  { value: "other", label: isVi ? "Khác" : "Other" },
                ]}
                placeholder={t.englishCertTypePh}
                isVi={isVi}
                searchable={false}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {renderLabel(t.englishCertScore)}
              </label>
              <input
                type="text"
                disabled={form.englishCertType === "none" || !form.englishCertType}
                value={form.englishCertType !== "none" ? (form.englishCertScore || "") : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({
                    englishCertScore: val,
                    englishCert: `${(form.englishCertType || "other").toUpperCase()}: ${val}`
                  });
                }}
                placeholder={form.englishCertType !== "none" && form.englishCertType ? t.englishCertScorePh : (isVi ? "Không có" : "N/A")}
                className={`${inputBase} ${
                  form.englishCertType === "none" || !form.englishCertType
                    ? "bg-slate-100/80 dark:bg-slate-950/40 text-slate-400/80 dark:text-slate-650 border-slate-200/50 dark:border-slate-800/30 cursor-not-allowed opacity-50"
                    : errors.englishCertScore ? inputError : inputNormal
                }`}
              />
              {form.englishCertType !== "none" && errors.englishCertScore && (
                <p className="text-xs text-rose-500 mt-1">{errors.englishCertScore}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {renderLabel(t.achievementsExtracurricular)}
            </label>
            <textarea
              rows={3}
              value={form.achievementsExtracurricular}
              onChange={(e) => onChange({ achievementsExtracurricular: e.target.value })}
              placeholder={t.achievementsExtracurricularPh}
              className={`${inputBase} ${inputNormal}`}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GpaInput
              label={t.gpaCumulative}
              value={form.gpaCumulative}
              onChange={(val) => onChange({ gpaCumulative: val })}
              error={errors.gpaCumulative}
              placeholder={isVi ? "Ví dụ: 3.52" : "e.g. 3.52"}
              isVi={isVi}
            />
            <GpaInput
              label={t.gpaLatest}
              value={form.gpaLatest}
              onChange={(val) => onChange({ gpaLatest: val })}
              error={errors.gpaLatest}
              placeholder={isVi ? "Ví dụ: 3.52" : "e.g. 3.52"}
              isVi={isVi}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {renderLabel(t.achievementsExtracurricular)}
            </label>
            <textarea
              rows={3}
              value={form.achievementsExtracurricular}
              onChange={(e) => onChange({ achievementsExtracurricular: e.target.value })}
              placeholder={t.achievementsExtracurricularPh}
              className={`${inputBase} ${inputNormal}`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {renderLabel(t.englishCert)}
            </label>
            <input
              type="text"
              value={form.englishCert}
              onChange={(e) => onChange({ englishCert: e.target.value })}
              placeholder={t.englishCertPh}
              className={`${inputBase} ${inputNormal}`}
            />
          </div>
        </div>
      )}

      <hr className="border-slate-100 dark:border-slate-800" />

      <FileUploadCloudinary
        label={t.cvUploadLabel}
        hint={t.cvUploadHint}
        accept="application/pdf"
        maxSizeMB={10}
        folder="bdc_recruitment_2026_cv"
        value={form.cvFile}
        onChange={(file) => onChange({ cvFile: file })}
        error={errors.cvFile}
        required
      />

      <FileUploadCloudinary
        label={t.evidenceUploadLabel}
        hint={t.evidenceUploadHint}
        accept="application/pdf,image/png,image/jpeg,image/webp"
        maxSizeMB={10}
        folder="bdc_recruitment_2026_certs"
        isMulti
        maxFiles={5}
        values={form.evidenceFiles}
        onMultiChange={(files) => onChange({ evidenceFiles: files })}
      />
    </div>
  );
};
