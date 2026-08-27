import React from "react";
import { BookOpen, Award, FileCheck, Info, GraduationCap } from "lucide-react";
import { FormData, Errors, T, Lang, ENTRANCE_METHOD_OPTIONS, EntranceMethod } from "../types";
import { FileUploadCloudinary } from "./FileUploadCloudinary";
import { FSel } from "@/components/form/FormFields";
import { InfoTooltip } from "@/components/form/InfoTooltip";

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

  const [freshmanCvTab, setFreshmanCvTab] = React.useState<"file" | "text">(
    form.cvBioText && !form.cvFile ? "text" : "file"
  );

  return (
    <div className="space-y-7">
      {/* Section 1: Header & Mode context */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            {t.step2Header}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{t.step2Desc}</p>
        </div>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{isFreshman ? (isVi ? "Dành cho Tân sinh viên K26" : "Freshman Mode 2026") : (isVi ? "Dành cho Sinh viên Năm 1+" : "Senior Mode")}</span>
        </div>
      </div>

      {/* Dynamic Academic Inputs */}
      {isFreshman ? (
        <div className="space-y-5">
          {t.freshmanNoticeDesc && (
            <div className="pl-3 border-l-2 border-blue-500 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.freshmanNoticeDesc}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {renderLabel(t.entranceMethodLabel)}
            </label>
            <FSel
              value={form.entranceMethod || "combo_thpt_dgnl"}
              onChange={(val) => {
                const nextMethod = val as EntranceMethod;
                onChange({ entranceMethod: nextMethod });
              }}
              options={entranceOptions}
              placeholder={t.entranceMethodPh}
              isVi={isVi}
              searchable={false}
            />
          </div>

          {/* Dynamic Score Inputs based on Entrance Method */}
          {(!form.entranceMethod || form.entranceMethod === "combo_thpt_dgnl") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  {renderLabel(isVi ? "Điểm thi Tốt nghiệp THPT QG *" : "National High School Exam Score *")}
                </label>
                <input
                  type="text"
                  value={form.thptScore || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const combined = [
                      val ? `THPT: ${val}` : "",
                      form.dgnlScore ? `ĐGNL: ${form.dgnlScore}` : "",
                    ].filter(Boolean).join(" | ");

                    onChange({
                      thptScore: val,
                      entranceScoreDetail: combined || val,
                      thptDgnlScores: combined || val,
                    });
                  }}
                  placeholder={isVi ? "Ví dụ: Tổ hợp A00: 27.5 (Toán 9.2, Lý 9.0, Hóa 9.3)" : "e.g. A00: 27.5 (Math 9.2, Phys 9.0, Chem 9.3)"}
                  className={`${inputBase} ${errors.entranceScoreDetail ? inputError : inputNormal}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  {renderLabel(isVi ? "Điểm thi Đánh giá năng lực (ĐGNL) *" : "Competency Test (ĐGNL) Score *")}
                </label>
                <input
                  type="text"
                  value={form.dgnlScore || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const combined = [
                      form.thptScore ? `THPT: ${form.thptScore}` : "",
                      val ? `ĐGNL: ${val}` : "",
                    ].filter(Boolean).join(" | ");

                    onChange({
                      dgnlScore: val,
                      entranceScoreDetail: combined || val,
                      thptDgnlScores: combined || val,
                    });
                  }}
                  placeholder={isVi ? "Ví dụ: ĐGNL HCM: 920/1200 điểm (hoặc HSA: 110/150)" : "e.g. ĐGNL HCM: 920/1200 or HSA: 110/150"}
                  className={`${inputBase} ${errors.entranceScoreDetail ? inputError : inputNormal}`}
                />
              </div>
              {errors.entranceScoreDetail && (
                <p className="col-span-full text-xs text-rose-500 mt-1">{errors.entranceScoreDetail}</p>
              )}
            </div>
          )}

          {form.entranceMethod === "thpt" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  {renderLabel(isVi ? "Chi tiết Điểm thi Tốt nghiệp THPT QG *" : "National High School Exam Score Details *")}
                </label>
                <input
                  type="text"
                  value={form.thptScore || form.entranceScoreDetail || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const combined = [
                      `THPT: ${val}`,
                      form.dgnlScore ? `ĐGNL: ${form.dgnlScore}` : "",
                    ].filter(Boolean).join(" | ");
                    onChange({
                      thptScore: val,
                      entranceScoreDetail: combined,
                      thptDgnlScores: combined,
                    });
                  }}
                  placeholder={isVi ? "Ví dụ: Khối A00: 27.5 (Toán 9.2, Lý 9.0, Hóa 9.3)" : "e.g. A00: 27.5 (Math 9.2, Phys 9.0, Chem 9.3)"}
                  className={`${inputBase} ${errors.entranceScoreDetail ? inputError : inputNormal}`}
                />
                {errors.entranceScoreDetail && <p className="text-xs text-rose-500 mt-1">{errors.entranceScoreDetail}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {isVi ? "Điểm thi ĐGNL (nếu có thi nhưng không dùng xét tuyển - Tùy chọn)" : "Competency Test Score (if taken - Optional)"}
                </label>
                <input
                  type="text"
                  value={form.dgnlScore || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const mainThpt = form.thptScore || form.entranceScoreDetail || "";
                    const combined = [
                      mainThpt ? `THPT: ${mainThpt}` : "",
                      val ? `ĐGNL: ${val}` : "",
                    ].filter(Boolean).join(" | ");
                    onChange({
                      dgnlScore: val,
                      entranceScoreDetail: combined || mainThpt,
                      thptDgnlScores: combined || mainThpt,
                    });
                  }}
                  placeholder={isVi ? "Ví dụ: ĐGNL HCM 920/1200 (Bỏ qua nếu không thi)" : "e.g. 920/1200 (Optional)"}
                  className={`${inputBase} ${inputNormal}`}
                />
              </div>
            </div>
          )}

          {form.entranceMethod === "dgnl_hcm" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  {renderLabel(isVi ? "Chi tiết Điểm thi Đánh giá năng lực (ĐGNL / HSA / TSA) *" : "Competency Test Score Details *")}
                </label>
                <input
                  type="text"
                  value={form.dgnlScore || form.entranceScoreDetail || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const combined = [
                      form.thptScore ? `THPT: ${form.thptScore}` : "",
                      `ĐGNL: ${val}`,
                    ].filter(Boolean).join(" | ");
                    onChange({
                      dgnlScore: val,
                      entranceScoreDetail: combined,
                      thptDgnlScores: combined,
                    });
                  }}
                  placeholder={isVi ? "Ví dụ: ĐGNL HCM 920/1200 điểm (hoặc HSA 110/150)" : "e.g. ĐGNL HCM 920/1200 or HSA 110/150"}
                  className={`${inputBase} ${errors.entranceScoreDetail ? inputError : inputNormal}`}
                />
                {errors.entranceScoreDetail && <p className="text-xs text-rose-500 mt-1">{errors.entranceScoreDetail}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {isVi ? "Điểm thi THPT Tốt nghiệp (Tùy chọn)" : "High School Graduation Exam Score (Optional)"}
                </label>
                <input
                  type="text"
                  value={form.thptScore || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const mainDgnl = form.dgnlScore || form.entranceScoreDetail || "";
                    const combined = [
                      val ? `THPT: ${val}` : "",
                      mainDgnl ? `ĐGNL: ${mainDgnl}` : "",
                    ].filter(Boolean).join(" | ");
                    onChange({
                      thptScore: val,
                      entranceScoreDetail: combined || mainDgnl,
                      thptDgnlScores: combined || mainDgnl,
                    });
                  }}
                  placeholder={isVi ? "Ví dụ: Khối A01: 27.0 điểm (Bỏ qua nếu muốn)" : "e.g. Block A01: 27.0 pts"}
                  className={`${inputBase} ${inputNormal}`}
                />
              </div>
            </div>
          )}

          {(form.entranceMethod === "hocba" || form.entranceMethod === "direct_international" || form.entranceMethod === "other") && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {renderLabel(
                  form.entranceMethod === "hocba"
                    ? (isVi ? "Chi tiết Điểm Học bạ THPT *" : "High School Transcript Scores *")
                    : form.entranceMethod === "direct_international"
                    ? (isVi ? "Chi tiết Phương thức & Điểm số / Thành tích *" : "Admission Method & Achievement Details *")
                    : (isVi ? "Mô tả phương thức & kết quả trúng tuyển *" : "Method & Result Details *")
                )}
              </label>
              <input
                type="text"
                value={form.entranceScoreDetail || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({
                    entranceScoreDetail: val,
                    thptDgnlScores: `${form.entranceMethod}: ${val}`,
                  });
                }}
                placeholder={
                  form.entranceMethod === "hocba"
                    ? (isVi ? "Ví dụ: ĐTB 3 năm 8.8 (hoặc Học bạ 5 HK 27.5)" : "e.g. GPA 3 years 8.8/10.0")
                    : form.entranceMethod === "direct_international"
                    ? (isVi ? "Ví dụ: SAT 1420/1600 hoặc Tuyển thẳng HSG Quốc gia" : "e.g. SAT 1420/1600 or National Olympiad Winner")
                    : (isVi ? "Ví dụ: Điểm xét tuyển riêng của trường..." : "e.g. University specific admission test score...")
                }
                className={`${inputBase} ${errors.entranceScoreDetail ? inputError : inputNormal}`}
              />
              {errors.entranceScoreDetail && <p className="text-xs text-rose-500 mt-1">{errors.entranceScoreDetail}</p>}
            </div>
          )}

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
        <div className="space-y-5">
          {t.seniorNoticeDesc && (
            <div className="pl-3 border-l-2 border-blue-500 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.seniorNoticeDesc}
            </div>
          )}

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

      {/* Divider */}
      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Section 2: CV Ứng tuyển */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
              <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{isVi ? "CV ứng tuyển (PDF)" : "Curriculum Vitae (PDF)"}</span>
              <InfoTooltip text={t.cvUploadHint} fieldKey="cvFile" />
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {!isFreshman ? (isVi ? "(Bắt buộc)" : "(Required)") : (isVi ? "(Tùy chọn cho K26)" : "(Optional for K26)")}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isVi ? "Dung lượng tối đa 10MB" : "Max size 10MB"}
            </p>
          </div>

          {/* Freshman Toggle Option */}
          {isFreshman && (
            <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800/90 rounded-lg border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFreshmanCvTab("file")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  freshmanCvTab === "file"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {isVi ? "File CV (PDF)" : "Upload PDF"}
              </button>
              <button
                type="button"
                onClick={() => setFreshmanCvTab("text")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  freshmanCvTab === "text"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {isVi ? "Giới thiệu bản thân" : "Write Bio"}
              </button>
            </div>
          )}
        </div>

        {/* Content depending on Freshman tab selection or default standard upload */}
        {(!isFreshman || freshmanCvTab === "file") ? (
          <div>
            <FileUploadCloudinary
              label=""
              hint={t.cvUploadHint}
              accept="application/pdf"
              maxSizeMB={10}
              folder="bdc_recruitment_2026_cv"
              value={form.cvFile}
              onChange={(file) => onChange({ cvFile: file })}
              error={errors.cvFile}
              required={!isFreshman}
            />
            {isFreshman && !form.cvFile && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{isVi ? "Tân sinh viên chưa có CV? Bạn có thể chuyển qua nút \"Giới thiệu bản thân\" phía trên." : "Don't have a CV yet? Switch to \"Write Bio\" above."}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2 animate-fadeIn pt-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {renderLabel(t.cvBioTextLabel)}
            </label>
            <textarea
              rows={4}
              value={form.cvBioText || ""}
              onChange={(e) => onChange({ cvBioText: e.target.value })}
              placeholder={t.cvBioTextPh}
              className={`${inputBase} ${errors.cvBioText ? inputError : inputNormal}`}
            />
            {errors.cvBioText && <p className="text-xs text-rose-500 mt-1">{errors.cvBioText}</p>}
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Section 3: Minh chứng & Bằng cấp bổ sung */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{isVi ? "Minh chứng & Chứng chỉ bổ sung" : "Supporting Certificates & Evidence"}</span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              {isVi ? "(Tùy chọn, tối đa 5 file)" : "(Optional, max 5 files)"}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi ? "Bảng điểm, Học bạ, Chứng chỉ Tiếng Anh, Bằng khen..." : "Transcripts, English Certs, Awards..."}
          </p>
        </div>

        <FileUploadCloudinary
          label=""
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
    </div>
  );
};

