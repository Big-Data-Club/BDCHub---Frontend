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
  "w-full bg-white dark:bg-[#070E1B] border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all duration-200";
const inputNormal =
  "border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-[#070E1B] focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
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
  // Parse value: format can be "3.65/4.0", "8.5/10.0", or custom "85/100"
  const [gpaNumeric, gpaScaleStr] = React.useMemo(() => {
    const val = value || "";
    const index = val.indexOf("/");
    if (index !== -1) {
      return [val.slice(0, index).trim(), val.slice(index + 1).trim()];
    }
    return [val.trim(), "4.0"];
  }, [value]);

  const isStandard4 = gpaScaleStr === "4.0";
  const isStandard10 = gpaScaleStr === "10.0";
  const mode: "4.0" | "10.0" | "custom" = isStandard4 ? "4.0" : isStandard10 ? "10.0" : "custom";

  const handleNumericChange = (newNum: string) => {
    if (mode === "custom") {
      const scalePart = gpaScaleStr ? `/${gpaScaleStr}` : "";
      onChange(`${newNum}${scalePart}`);
    } else {
      const cleanNum = newNum.replace(/\/.*/g, "").trim();
      onChange(`${cleanNum}/${mode}`);
    }
  };

  const handleCustomScaleChange = (newScale: string) => {
    const cleanScale = newScale.replace(/^\//, "").trim();
    onChange(`${gpaNumeric}/${cleanScale}`);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (mode === "custom") return;
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
      onChange(`${formatted}/${mode}`);
    }
  };

  const handleModeChange = (newMode: "4.0" | "10.0" | "custom") => {
    const cleanNum = gpaNumeric.replace(/[^0-9.,]/g, "");
    if (newMode === "4.0") {
      onChange(`${cleanNum}/4.0`);
    } else if (newMode === "10.0") {
      onChange(`${cleanNum}/10.0`);
    } else {
      onChange(`${gpaNumeric}/${gpaScaleStr !== "4.0" && gpaScaleStr !== "10.0" ? gpaScaleStr : "100"}`);
    }
  };

  // Smart hint detection
  const numVal = parseFloat(gpaNumeric);
  const showWarning = mode === "4.0" && !isNaN(numVal) && numVal > 4.0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          {renderLabel(label)}
        </label>

        {/* Segmented Scale Switcher */}
        <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800/90 rounded-lg border border-slate-200/80 dark:border-slate-700/60 text-[11px] font-semibold shrink-0">
          <button
            type="button"
            onClick={() => handleModeChange("4.0")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              mode === "4.0"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Hệ 4.0
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("10.0")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              mode === "10.0"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Hệ 10.0
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("custom")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              mode === "custom"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Tùy chỉnh
          </button>
        </div>
      </div>

      {mode === "custom" ? (
        /* Split 2 Input Fields for Custom Scale with zero layout jump */
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-3">
            <input
              type="text"
              placeholder={isVi ? "Điểm (Ví dụ: 85, 3.8...)" : "Score (e.g. 85, 3.8...)"}
              value={gpaNumeric}
              onChange={(e) => handleNumericChange(e.target.value)}
              className={`${inputBase} ${error ? inputError : inputNormal} font-mono tracking-tight`}
            />
          </div>
          <div className="col-span-2">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 text-sm font-bold pointer-events-none select-none">/</span>
              <input
                type="text"
                placeholder={isVi ? "Thang (100)" : "Scale (100)"}
                value={gpaScaleStr}
                onChange={(e) => handleCustomScaleChange(e.target.value)}
                className={`${inputBase} ${error ? inputError : inputNormal} pl-7 font-mono tracking-tight`}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Standard Single Field with Fixed Suffix */
        <div className="relative w-full">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={placeholder || (mode === "4.0" ? "Ví dụ: 3.65" : "Ví dụ: 8.5")}
              value={gpaNumeric}
              onChange={(e) => handleNumericChange(e.target.value)}
              onBlur={handleBlur}
              className={`${inputBase} ${error ? inputError : inputNormal} pr-16 font-mono tracking-tight`}
            />
            <span className="absolute right-4 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none select-none tracking-tight">
              /{mode}
            </span>
          </div>
        </div>
      )}

      {showWarning && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1.5 font-medium leading-tight">
          <span>⚠️</span>
          <span>{isVi ? "Điểm hệ 4.0 thường ≤ 4.0. Bạn có muốn chuyển sang Hệ 10.0 không?" : "GPA on 4.0 scale is usually ≤ 4.0. Switch to 10.0 scale?"}</span>
        </p>
      )}

      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
};

export const Step2Academic: React.FC<Step2AcademicProps> = ({ form, onChange, errors, lang }) => {
  const t = T[lang];
  const isVi = lang === "vi";
  const isFreshman = form.academicStatus === "freshman";

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          {t.step2Header}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.step2Desc}</p>
      </div>

      {/* Status Notice Banner */}
      {!isFreshman && (
        <div className="p-4 rounded-xl border bg-slate-50 dark:bg-[#070E1B] border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t.seniorNoticeTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {t.seniorNoticeDesc}
          </p>
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
