import React from "react";
import { BookOpen, Award, FileCheck, Info, GraduationCap, AlertTriangle } from "lucide-react";
import { FormData, Errors, T, Lang, THPT_BLOCK_OPTIONS } from "../types";
import { FileUploadCloudinary } from "./FileUploadCloudinary";
import { FIn, FTa, FSel, FL } from "@/components/form/FormFields";
import { InfoTooltip } from "@/components/form/InfoTooltip";

interface Step2AcademicProps {
  form: FormData;
  onChange: (fields: Partial<FormData>) => void;
  errors: Errors;
  lang: Lang;
}

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
    const sanitized = newNum.replace(/[^0-9.,]/g, "");
    if (mode === "custom") {
      const scalePart = gpaScaleStr ? `/${gpaScaleStr}` : "";
      onChange(`${sanitized}${scalePart}`);
    } else {
      onChange(`${sanitized}/${mode}`);
    }
  };

  const handleCustomScaleChange = (newScale: string) => {
    const cleanScale = newScale.replace(/[^0-9.]/g, "").trim();
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
  const isNumber = !isNaN(numVal) && gpaNumeric !== "";

  const showWarning4Over = mode === "4.0" && isNumber && numVal > 4.0;
  const showWarning10Over = mode === "10.0" && isNumber && numVal > 10.0;

  const dynamicPlaceholder = placeholder || (
    mode === "4.0"
      ? (isVi ? "Ví dụ: 3.65" : "e.g. 3.65")
      : mode === "10.0"
      ? (isVi ? "Ví dụ: 8.5" : "e.g. 8.5")
      : (isVi ? "Ví dụ: 85" : "e.g. 85")
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <FL>{label}</FL>

        <div className="inline-flex p-0.5 bg-slate-100 dark:bg-[#0D192E] rounded-xl border border-slate-200 dark:border-blue-500/20 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => handleModeChange("4.0")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mode === "4.0"
                ? "bg-white dark:bg-[#0F1E35] text-blue-600 dark:text-cyan-400 shadow-xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Thang 4.0
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("10.0")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mode === "10.0"
                ? "bg-white dark:bg-[#0F1E35] text-blue-600 dark:text-cyan-400 shadow-xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Thang 10.0
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("custom")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mode === "custom"
                ? "bg-white dark:bg-[#0F1E35] text-blue-600 dark:text-cyan-400 shadow-xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {isVi ? "Khác" : "Custom"}
          </button>
        </div>
      </div>

      {mode === "custom" ? (
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-3">
            <FIn
              type="text"
              placeholder={isVi ? "Điểm (Ví dụ: 85, 3.8...)" : "Score (e.g. 85, 3.8...)"}
              value={gpaNumeric}
              onChange={(e) => handleNumericChange(e.target.value)}
              error={error}
              className="font-mono tracking-tight"
            />
          </div>
          <div className="col-span-2">
            <FIn
              type="text"
              placeholder={isVi ? "Thang (100)" : "Scale (100)"}
              value={gpaScaleStr}
              onChange={(e) => handleCustomScaleChange(e.target.value)}
              error={error}
              className="font-mono tracking-tight"
            />
          </div>
        </div>
      ) : (
        <FIn
          type="text"
          placeholder={dynamicPlaceholder}
          value={gpaNumeric}
          onChange={(e) => handleNumericChange(e.target.value)}
          onBlur={handleBlur}
          suffix={`/${mode}`}
          error={error}
          className="font-mono tracking-tight"
        />
      )}

      {showWarning4Over && (
        <div className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center justify-between gap-1.5 font-medium leading-tight flex-wrap bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span>{isVi ? "Điểm hệ 4.0 thường ≤ 4.0." : "GPA on 4.0 scale is usually ≤ 4.0."}</span>
          </div>
          <button
            type="button"
            onClick={() => handleModeChange("10.0")}
            className="text-blue-600 dark:text-cyan-400 hover:underline font-bold text-xs cursor-pointer ml-auto"
          >
            {isVi ? "Chuyển sang Thang 10.0" : "Switch to 10.0 scale"}
          </button>
        </div>
      )}

      {showWarning10Over && (
        <div className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1.5 font-medium leading-tight bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-200/60 dark:border-rose-800/40">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{isVi ? "Điểm hệ 10.0 không được vượt quá 10.0." : "GPA on 10.0 scale cannot exceed 10.0."}</span>
        </div>
      )}
    </div>
  );
};

export const Step2Academic: React.FC<Step2AcademicProps> = ({ form, onChange, errors, lang }) => {
  const t = T[lang];
  const isVi = lang === "vi";
  const isFreshman = form.academicStatus === "freshman";

  const thptBlockOptions = React.useMemo(() => {
    return THPT_BLOCK_OPTIONS.map((opt) => ({
      value: opt.id,
      label: isVi ? opt.labelVi : opt.labelEn,
    }));
  }, [isVi]);

  const handleEntranceUpdate = (updates: Partial<FormData>) => {
    const nextForm = { ...form, ...updates };

    const currentBlockId = nextForm.thptBlock || "A00";
    const blockObj = THPT_BLOCK_OPTIONS.find((b) => b.id === currentBlockId);
    const isOtherBlock = currentBlockId === "other";

    const blockLabel = isOtherBlock
      ? (isVi ? "Phương thức khác" : "Custom Method")
      : (blockObj ? (isVi ? blockObj.labelVi.split(" (")[0] : blockObj.labelEn.split(" (")[0]) : currentBlockId);

    const scoreText = nextForm.thptScore?.trim() || "";
    const thptPart = isOtherBlock
      ? (scoreText ? `Phương thức khác: ${scoreText}` : "Phương thức khác")
      : (scoreText ? `${blockLabel}: ${scoreText}` : blockLabel);

    const dgnlPart = nextForm.hasDgnl === "no"
      ? (isVi ? "ĐGNL: Chưa thi / Không thi" : "ĐGNL: Not taken")
      : (nextForm.dgnlScore?.trim() ? `ĐGNL: ${nextForm.dgnlScore.trim()}` : "");

    const combined = [thptPart, dgnlPart].filter(Boolean).join(" | ");

    onChange({
      ...updates,
      entranceScoreDetail: combined,
      thptDgnlScores: combined,
    });
  };

  const englishCertOptions = React.useMemo(() => [
    { value: "none", label: isVi ? "Chưa có" : "None" },
    { value: "IELTS", label: "IELTS" },
    { value: "TOEIC", label: "TOEIC" },
    { value: "TOEFL", label: "TOEFL" },
    { value: "VSTEP", label: "VSTEP" },
    { value: "PTE", label: "PTE Academic" },
    { value: "SAT", label: "SAT (Reading & Writing)" },
    { value: "Cambridge", label: "Cambridge Cert (FCE/CAE/CPE)" },
    { value: "other", label: isVi ? "Khác (Bổ sung mới kế bên...)" : "Other (Specify next to...)" },
  ], [isVi]);

  const renderEnglishCertFields = () => {
    const isNone = !form.englishCertType || form.englishCertType === "none";
    const isOtherCert = form.englishCertType === "other";

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FSel
          label={t.englishCertType}
          value={form.englishCertType || "none"}
          onChange={(val) => {
            const isPredefined = englishCertOptions.some(o => o.value === val);
            if (isPredefined) {
              const nextIsNone = val === "none";
              const nextScore = nextIsNone ? "" : (form.englishCertScore || "");
              onChange({
                englishCertType: val,
                englishCertScore: val === "other" ? (form.englishCertScore || "") : nextScore,
                englishCert: nextIsNone ? "Chưa có" : `${val.toUpperCase()}: ${nextScore}`
              });
            } else {
              // User entered a custom text from search bar: auto-set to 'other' and fill the custom text into score/detail input
              onChange({
                englishCertType: "other",
                englishCertScore: val,
                englishCert: `OTHER: ${val}`
              });
            }
          }}
          options={englishCertOptions}
          placeholder={isVi ? "Tìm hoặc nhập bổ sung chứng chỉ..." : "Search or enter custom certificate..."}
          isVi={isVi}
          searchable={true}
        />

        <div>
          <FIn
            label={
              isOtherCert
                ? (isVi ? "Tên chứng chỉ khác & Điểm số *" : "Custom Certificate & Score *")
                : t.englishCertScore
            }
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
            placeholder={
              isNone
                ? (isVi ? "Không có" : "N/A")
                : isOtherCert
                ? (isVi ? "Ví dụ: Duolingo English Test 120/160" : "e.g. Duolingo English Test 120/160")
                : t.englishCertScorePh
            }
            error={!isNone ? errors.englishCertScore : undefined}
            className={
              isNone
                ? "bg-slate-100/80 dark:bg-slate-950/40 text-slate-400/80 dark:text-slate-600 border-slate-200/50 dark:border-slate-800/30 cursor-not-allowed opacity-50"
                : ""
            }
          />
        </div>
      </div>
    );
  };

  const [freshmanCvTab, setFreshmanCvTab] = React.useState<"file" | "text">(
    form.cvBioText && !form.cvFile ? "text" : "file"
  );

  const isOtherBlock = form.thptBlock === "other";

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
          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>{isFreshman ? (isVi ? "Dành cho Tân sinh viên" : "Freshman Mode") : (isVi ? "Dành cho Sinh viên Năm 1+" : "Senior Mode")}</span>
        </div>
      </div>

      {/* Dynamic Academic Inputs */}
      {isFreshman ? (
        <div className="space-y-6">
          {/* Section 1: Block & Score selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{isVi ? "1. Tổ hợp xét tuyển & Điểm thi THPT / Đại học" : "1. Admission Block & Exam Score"}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select Combo Box cho Tổ hợp */}
              <FSel
                label={isVi ? "Tổ hợp xét tuyển Đại học *" : "Admission Subject Block *"}
                value={form.thptBlock || "A00"}
                onChange={(val) => {
                  const isPredefined = thptBlockOptions.some(o => o.value === val);
                  if (isPredefined) {
                    handleEntranceUpdate({ thptBlock: val });
                  } else {
                    // Custom typed value from search: auto-set to 'other' and fill the typed string into thptScore
                    handleEntranceUpdate({ thptBlock: "other", thptScore: val });
                  }
                }}
                options={thptBlockOptions}
                placeholder={isVi ? "Chọn tổ hợp xét tuyển..." : "Select block..."}
                isVi={isVi}
                searchable={true}
              />

              {/* Dynamic Input: Nhập điểm hoặc Nhập tên tổ hợp/phương thức khác */}
              <div key={isOtherBlock ? "other-mode" : "standard-mode"} className="transition-all duration-300">
                <FIn
                  label={
                    isOtherBlock
                      ? (isVi ? "Tên tổ hợp / Phương thức khác & Kết quả *" : "Custom Block & Score Details *")
                      : (isVi ? "Điểm thi / Điểm xét tuyển THPT *" : "THPT / Admission Score *")
                  }
                  type="text"
                  value={form.thptScore || ""}
                  onChange={(e) => handleEntranceUpdate({ thptScore: e.target.value })}
                  placeholder={
                    isOtherBlock
                      ? (isVi ? "Ví dụ: Khối A02: 27.0 điểm (hoặc Xét tuyển thẳng SAT, Xét tuyển riêng...)" : "e.g. Block A02: 27.0 pts or Special Admission Test...")
                      : (isVi ? "Ví dụ: 27.5 (Toán 9.2, Lý 9.0, Hóa 9.3)" : "e.g. 27.5 (Math 9.2, Phys 9.0, Chem 9.3)")
                  }
                  error={errors.thptScore || errors.entranceScoreDetail}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200/80 dark:border-slate-800/80" />

          {/* Section 2: Điểm Đánh giá năng lực (ĐGNL) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 font-bold text-sm">
                <Award className="w-4 h-4 shrink-0" />
                <span>{isVi ? "2. Kết quả đánh giá năng lực" : "2. Competency Assessment Results"}</span>
                <InfoTooltip
                  text={
                    isVi
                      ? "Nếu bạn xét tuyển không sử dụng kết quả Kỳ thi ĐGNL, vui lòng chọn 'Không thi ĐGNL'."
                      : "If your admission method does not use Competency Test (ĐGNL) scores, please select 'No ĐGNL'."
                  }
                  fieldKey="dgnlScore"
                />
              </div>

              {/* Gentle Option Selector */}
              <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium self-start sm:self-auto shrink-0 border border-slate-200/80 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => handleEntranceUpdate({ hasDgnl: "yes" })}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-semibold border ${
                    form.hasDgnl !== "no"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border-white dark:border-slate-900"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-transparent"
                  }`}
                >
                  {isVi ? "Có thi ĐGNL" : "Took test"}
                </button>
                <button
                  type="button"
                  onClick={() => handleEntranceUpdate({ hasDgnl: "no", dgnlScore: "" })}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-semibold border ${
                    form.hasDgnl === "no"
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs border-slate-200 dark:border-slate-700"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-transparent"
                  }`}
                >
                  {isVi ? "Không thi ĐGNL" : "No ĐGNL"}
                </button>
              </div>
            </div>

            <FIn
              label={isVi ? "Điểm thi Đánh giá năng lực" : "Competency Test Score"}
              req={form.hasDgnl !== "no"}
              fieldKey="dgnlScore"
              type="text"
              disabled={form.hasDgnl === "no"}
              value={form.hasDgnl === "no" ? "" : (form.dgnlScore || "")}
              onChange={(e) => handleEntranceUpdate({ dgnlScore: e.target.value })}
              placeholder={
                form.hasDgnl === "no"
                  ? (isVi ? "Không yêu cầu nhập (đã chọn Không thi ĐGNL)" : "Disabled (Selected No ĐGNL)")
                  : (isVi ? "Ví dụ: ĐGNL HCM 920/1200 điểm (hoặc HSA 110/150, TSA 75/100)" : "e.g. ĐGNL HCM 920/1200 or HSA 110/150")
              }
              error={form.hasDgnl !== "no" ? errors.dgnlScore : undefined}
              className={
                form.hasDgnl === "no"
                  ? "bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-800"
                  : ""
              }
            />
          </div>

          <hr className="border-slate-200/80 dark:border-slate-800/80" />

          {renderEnglishCertFields()}

          <FTa
            label={t.achievementsExtracurricular}
            rows={3}
            value={form.achievementsExtracurricular}
            onChange={(e) => onChange({ achievementsExtracurricular: e.target.value })}
            placeholder={t.achievementsExtracurricularPh}
          />
        </div>
      ) : (
        <div className="space-y-5">
          {t.seniorNoticeDesc && (
            <div className="p-4 border border-blue-200 dark:border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 text-xs text-blue-950 dark:text-blue-200 leading-relaxed rounded-xl font-medium">
              {t.seniorNoticeDesc}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GpaInput
              label={t.gpaCumulative}
              value={form.gpaCumulative}
              onChange={(val) => onChange({ gpaCumulative: val })}
              error={errors.gpaCumulative}
              isVi={isVi}
            />
            <GpaInput
              label={t.gpaLatest}
              value={form.gpaLatest}
              onChange={(val) => onChange({ gpaLatest: val })}
              error={errors.gpaLatest}
              isVi={isVi}
            />
          </div>

          <hr className="border-slate-200/80 dark:border-slate-800/80" />

          {renderEnglishCertFields()}

          <FTa
            label={t.achievementsExtracurricular}
            rows={3}
            value={form.achievementsExtracurricular}
            onChange={(e) => onChange({ achievementsExtracurricular: e.target.value })}
            placeholder={t.achievementsExtracurricularPh}
          />
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
                {!isFreshman ? (isVi ? "(Bắt buộc)" : "(Required)") : (isVi ? "(Tùy chọn)" : "(Optional)")}
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
              accept="application/pdf"
              maxSizeMB={10}
              folder="bdc_recruitment_2026_cv"
              value={form.cvFile}
              onChange={(file) => onChange({ cvFile: file })}
              error={errors.cvFile}
              required={!isFreshman}
            />
            {isFreshman && !form.cvFile && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{isVi ? "Tân sinh viên chưa có CV? Bạn có thể chuyển qua nút \"Giới thiệu bản thân\" phía trên." : "Don't have a CV yet? Switch to \"Write Bio\" above."}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2 animate-dropdown-fade-in pt-1">
            <FTa
              label={t.cvBioTextLabel}
              rows={4}
              value={form.cvBioText || ""}
              onChange={(e) => onChange({ cvBioText: e.target.value })}
              placeholder={t.cvBioTextPh}
              error={errors.cvBioText}
            />
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


