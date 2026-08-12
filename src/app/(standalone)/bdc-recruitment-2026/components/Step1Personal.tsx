"use client";

import React from "react";
import { User, Mail, Phone, Globe, GraduationCap, Building, IdCard, Sparkles } from "lucide-react";
import { FormData, Errors, T, Lang, ACADEMIC_STATUS_OPTIONS, AcademicStatus } from "../types";
import { FSel } from "../../hpc-summer-school/components/FormFields";
import universitiesData from "../../hpc-summer-school/universities.json";

interface Step1PersonalProps {
  form: FormData;
  onChange: (fields: Partial<FormData>) => void;
  errors: Errors;
  lang: Lang;
}

const inputBase =
  "w-full bg-slate-50 dark:bg-[#0D192E] border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-200";
const inputNormal =
  "border-slate-300 dark:border-blue-500/20 focus:bg-white dark:focus:bg-[#0A1628] focus:border-blue-500 dark:focus:border-cyan-400/50 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20";
const inputError =
  "border-rose-400 dark:border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-rose-500/30";

export const Step1Personal: React.FC<Step1PersonalProps> = ({ form, onChange, errors, lang }) => {
  const t = T[lang];
  const isVi = lang === "vi";

  const uniOptions = React.useMemo(() => {
    return universitiesData.map(uni => ({
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
  }, [isVi]);

  // If university has a value and it is not one of the predefined ones, it is custom (Other)
  const isPredefined = form.university === "" || universitiesData.some(
    uni => (uni.labelVi === form.university || uni.labelEn === form.university) && uni.value !== "Other"
  );
  const [showOtherInput, setShowOtherInput] = React.useState(!isPredefined);

  React.useEffect(() => {
    if (form.university !== "") {
      const isPredefinedVal = universitiesData.some(
        uni => (uni.labelVi === form.university || uni.labelEn === form.university) && uni.value !== "Other"
      );
      setShowOtherInput(!isPredefinedVal);
    }
  }, [form.university]);

  const handleDropdownChange = (val: string) => {
    if (val === "Other") {
      setShowOtherInput(true);
      onChange({ university: "" });
    } else if (val === "") {
      setShowOtherInput(false);
      onChange({ university: "" });
    } else {
      const option = uniOptions.find(o => o.value === val);
      if (option) {
        setShowOtherInput(false);
        onChange({ university: option.label });
      } else {
        // Custom value from "Search & Auto-fill"
        setShowOtherInput(true);
        onChange({ university: val });
      }
    }
  };

  const currentDropdownValue = (() => {
    if (showOtherInput) return "Other";
    if (!form.university) return "";
    const found = universitiesData.find(
      uni => (uni.labelVi === form.university || uni.labelEn === form.university) && uni.value !== "Other"
    );
    return found ? found.value : "";
  })();

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-200/80 dark:border-blue-500/15 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-cyan-500/20">
            <User className="w-5 h-5" />
          </div>
          {t.step1Header}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{t.step1Desc}</p>
      </div>

      {/* Confirmation Email */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
          {renderLabel(t.emailConfirmation)}
        </label>
        <input
          type="email"
          value={form.emailConfirmation}
          onChange={(e) => onChange({ emailConfirmation: e.target.value })}
          placeholder={t.emailConfirmationPh}
          className={`${inputBase} ${errors.emailConfirmation ? inputError : inputNormal}`}
        />
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t.emailConfirmationHint}</p>
        {errors.emailConfirmation && <p className="text-xs text-rose-500 mt-1">{errors.emailConfirmation}</p>}
      </div>

      {/* Full Name & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            {renderLabel(t.fullName)}
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder={t.fullNamePh}
            className={`${inputBase} ${errors.fullName ? inputError : inputNormal}`}
          />
          {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            {renderLabel(t.phone)}
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder={t.phonePh}
            className={`${inputBase} ${errors.phone ? inputError : inputNormal}`}
          />
          {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Emails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            {renderLabel(t.emailPersonal)}
          </label>
          <input
            type="email"
            value={form.emailPersonal}
            onChange={(e) => onChange({ emailPersonal: e.target.value })}
            placeholder={t.emailPersonalPh}
            className={`${inputBase} ${errors.emailPersonal ? inputError : inputNormal}`}
          />
          {errors.emailPersonal && <p className="text-xs text-rose-500 mt-1">{errors.emailPersonal}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            {renderLabel(t.emailSchool)}
          </label>
          <input
            type="email"
            value={form.emailSchool}
            onChange={(e) => onChange({ emailSchool: e.target.value })}
            placeholder={t.emailSchoolPh}
            className={`${inputBase} ${errors.emailSchool ? inputError : inputNormal}`}
          />
          {errors.emailSchool && <p className="text-xs text-rose-500 mt-1">{errors.emailSchool}</p>}
        </div>
      </div>

      {/* Facebook */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
          {renderLabel(t.facebookLink)}
        </label>
        <input
          type="url"
          value={form.facebookLink}
          onChange={(e) => onChange({ facebookLink: e.target.value })}
          placeholder={t.facebookLinkPh}
          className={`${inputBase} ${errors.facebookLink ? inputError : inputNormal}`}
        />
        {errors.facebookLink && <p className="text-xs text-rose-500 mt-1">{errors.facebookLink}</p>}
      </div>

      {/* University Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
          {renderLabel(t.university)}
        </label>
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
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {renderLabel(isVi ? "Nhập tên trường khác *" : "Specify your university *")}
              </label>
              <input
                type="text"
                placeholder={isVi ? "Ví dụ: Trường Đại học Bách khoa, ĐHQG TP.HCM" : "e.g. HCMC University of Technology"}
                value={form.university}
                onChange={(e) => onChange({ university: e.target.value })}
                className={`${inputBase} ${errors.university ? inputError : inputNormal}`}
              />
              {errors.university && <p className="text-xs text-rose-500 mt-1">{errors.university}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Faculty + MSSV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            {renderLabel(t.faculty)}
          </label>
          <input
            type="text"
            value={form.faculty}
            onChange={(e) => onChange({ faculty: e.target.value })}
            placeholder={t.facultyPh}
            className={`${inputBase} ${errors.faculty ? inputError : inputNormal}`}
          />
          {errors.faculty && <p className="text-xs text-rose-500 mt-1">{errors.faculty}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            {renderLabel(t.studentId)}
          </label>
          <input
            type="text"
            value={form.studentId}
            onChange={(e) => onChange({ studentId: e.target.value })}
            placeholder={t.studentIdPh}
            className={`${inputBase} ${inputNormal}`}
          />
        </div>
      </div>

      {/* Academic Status */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          {renderLabel(t.academicStatus)}
        </label>

        <div className={`relative transition-all duration-300 space-y-3.5 ${
          form.academicStatus === "other"
            ? "pl-4.5 border-l-2 border-cyan-500/60 dark:border-cyan-500/40"
            : "pl-0 border-l-0 border-transparent"
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACADEMIC_STATUS_OPTIONS.map((opt) => {
              const isSelected = form.academicStatus === opt.id;
              return (
                <label
                  key={opt.id}
                  onClick={() => onChange({ academicStatus: opt.id as AcademicStatus })}
                  className={`relative flex items-center p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-500/15 border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-200 shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="academicStatus"
                    checked={isSelected}
                    onChange={() => onChange({ academicStatus: opt.id as AcademicStatus })}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 flex-shrink-0 ${
                    isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300 dark:border-slate-600 bg-transparent"
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-medium">
                    {lang === "vi" ? opt.labelVi : opt.labelEn}
                  </span>
                </label>
              );
            })}
          </div>

          {form.academicStatus === "other" && (
            <div className="animate-fadeIn mt-3">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                {renderLabel(isVi ? "Vui lòng ghi rõ trạng thái khác của bạn *" : "Please specify your status *")}
              </label>
              <input
                type="text"
                value={form.academicStatusOther}
                onChange={(e) => onChange({ academicStatusOther: e.target.value })}
                placeholder={t.academicStatusOtherPh}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>
          )}
        </div>

        {errors.academicStatus && <p className="text-xs text-rose-500 mt-1.5">{errors.academicStatus}</p>}
      </div>
    </div>
  );
};
