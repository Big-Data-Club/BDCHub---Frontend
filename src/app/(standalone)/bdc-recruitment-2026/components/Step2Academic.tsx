import React from "react";
import { BookOpen, Award, Sparkles, FileCheck, Info, GraduationCap } from "lucide-react";
import { FormData, Errors, T, Lang, ENTRANCE_METHOD_OPTIONS, EntranceMethod } from "../types";
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

  const numVal = parseFloat(gpaNumeric);
  const showWarning = mode === "4.0" && !isNaN(numVal) && numVal > 4.0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          {renderLabel(label)}
        </label>

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
          <svg className="w-3.5 h-3.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
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

  const entranceOptions = React.useMemo(() => {
    return ENTRANCE_METHOD_OPTIONS.map((opt) => ({
      value: opt.id,
      label: isVi ? opt.labelVi : opt.labelEn,
    }));
  }, [isVi]);

  const englishCertOptions = React.useMemo(() => [
    { value: "none", label: isVi ? "Chưa có" : "None" },
    { value: "IELTS", label: "IELTS" },
    { value: "TOEIC", label: "TOEIC" },
    { value: "TOEFL", label: "TOEFL" },
    { value: "VSTEP", label: "VSTEP" },
    { value: "PTE", label: "PTE Academic" },
    { value: "SAT", label: "SAT (Reading & Writing)" },
    { value: "Cambridge", label: "Cambridge Cert (FCE/CAE/CPE)" },
  ], [isVi]);

  const renderEnglishCertFields = () => {
    const isNone = !form.englishCertType || form.englishCertType === "none";
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            {renderLabel(t.englishCertType)}
          </label>
          <FSel
            value={form.englishCertType || "none"}
            onChange={(val) => {
              const nextIsNone = val === "none" || val === "";
              const nextScore = nextIsNone ? "" : (form.englishCertScore || "");
              onChange({
                englishCertType: val,
                englishCertScore: nextScore,
                englishCert: nextIsNone ? "Chưa có" : `${val.toUpperCase()}: ${nextScore}`
              });
            }}
            options={englishCertOptions}
            placeholder={isVi ? "Tìm hoặc nhập chứng chỉ..." : "Search or enter certificate..."}
            isVi={isVi}
            searchable={true}
          />
          {!isNone && !englishCertOptions.some((o) => o.value === form.englishCertType) && (
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1.5 flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <span>{isVi ? `Loại chứng chỉ khác: "${form.englishCertType}"` : `Other certificate type: "${form.englishCertType}"`}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            {renderLabel(t.englishCertScore)}
          </label>
          <input
            type="text"
            disabled={isNone}
            value={!isNone ? (form.englishCertScore || "") : ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange({
                englishCertScore: val,
                englishCert: `${(form.englishCertType || "other").toUpperCase()}: ${val}`
              });
            }}
            placeholder={!isNone ? t.englishCertScorePh : (isVi ? "Không có" : "N/A")}
            className={`${inputBase} ${
              isNone
                ? "bg-slate-100/80 dark:bg-slate-950/40 text-slate-400/80 dark:text-slate-600 border-slate-200/50 dark:border-slate-800/30 cursor-not-allowed opacity-50"
                : errors.englishCertScore ? inputError : inputNormal
            }`}
          />
          {!isNone && errors.englishCertScore && (
            <p className="text-xs text-rose-500 mt-1">{errors.englishCertScore}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header section with refined editorial divider */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          {t.step2Header}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.step2Desc}</p>
      </div>

      {/* Status Notice Banner */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#070E1B]">
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0 shadow-inner">
            {isFreshman ? <Sparkles className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                {isFreshman ? t.freshmanNoticeTitle : t.seniorNoticeTitle}
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-cyan-300 border border-blue-300/60 dark:border-blue-500/30 tracking-wider">
                {isFreshman ? (isVi ? "Tân sinh viên K26" : "Freshman 2026") : (isVi ? "Sinh viên Năm 1+" : "Senior Student")}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {isFreshman ? t.freshmanNoticeDesc : t.seniorNoticeDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Academic Inputs */}
      {isFreshman ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {renderLabel(t.entranceMethodLabel)}
            </label>
            <FSel
              value={form.entranceMethod || "thpt"}
              onChange={(val) => onChange({ entranceMethod: val as EntranceMethod })}
              options={entranceOptions}
              placeholder={t.entranceMethodPh}
              isVi={isVi}
              searchable={false}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {renderLabel(t.entranceScoreDetailLabel)}
            </label>
            <input
              type="text"
              value={form.entranceScoreDetail || ""}
              onChange={(e) => {
                const val = e.target.value;
                onChange({
                  entranceScoreDetail: val,
                  thptDgnlScores: `${form.entranceMethod || "thpt"}: ${val}`,
                });
              }}
              placeholder={
                form.entranceMethod === "dgnl_hcm"
                  ? (isVi ? "Ví dụ: 920 / 1200 điểm" : "e.g. 920 / 1200 pts")
                  : form.entranceMethod === "dgnl_hn"
                  ? (isVi ? "Ví dụ: 110 / 150 điểm" : "e.g. 110 / 150 pts")
                  : form.entranceMethod === "tsa"
                  ? (isVi ? "Ví dụ: 78.5 / 100 điểm" : "e.g. 78.5 / 100 pts")
                  : form.entranceMethod === "hocba"
                  ? (isVi ? "Ví dụ: ĐTB 3 năm 8.8 (hoặc Học bạ 5 HK 27.5)" : "e.g. GPA 8.8/10.0")
                  : form.entranceMethod === "direct_international"
                  ? (isVi ? "Ví dụ: SAT 1420/1600 hoặc Tuyển thẳng HSG Quốc gia" : "e.g. SAT 1420/1600")
                  : t.entranceScoreDetailPh
              }
              className={`${inputBase} ${errors.entranceScoreDetail ? inputError : inputNormal}`}
            />
            {errors.entranceScoreDetail && <p className="text-xs text-rose-500 mt-1">{errors.entranceScoreDetail}</p>}
          </div>

          {renderEnglishCertFields()}

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

          {renderEnglishCertFields()}

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
      )}

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* CV Section */}
      <div className="space-y-4">
        <FileUploadCloudinary
          label={isFreshman ? t.cvUploadLabelFreshman : t.cvUploadLabel}
          hint={t.cvUploadHint}
          accept="application/pdf"
          maxSizeMB={10}
          folder="bdc_recruitment_2026_cv"
          value={form.cvFile}
          onChange={(file) => onChange({ cvFile: file })}
          error={errors.cvFile}
          required={!isFreshman}
        />

        {/* Text alternative for Freshmen who don't have a CV PDF */}
        {isFreshman && !form.cvFile && (
          <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <Info className="w-4 h-4 shrink-0" />
              <span>{t.cvBioTextHint}</span>
            </div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {renderLabel(t.cvBioTextLabel)}
            </label>
            <textarea
              rows={3}
              value={form.cvBioText || ""}
              onChange={(e) => onChange({ cvBioText: e.target.value })}
              placeholder={t.cvBioTextPh}
              className={`${inputBase} ${errors.cvBioText ? inputError : inputNormal}`}
            />
            {errors.cvBioText && <p className="text-xs text-rose-500 mt-1">{errors.cvBioText}</p>}
          </div>
        )}
      </div>

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

