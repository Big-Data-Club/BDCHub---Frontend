"use client";

import React from "react";
import { User, Mail, Phone, Globe, GraduationCap, Building, IdCard, Sparkles } from "lucide-react";
import { FormData, Errors, T, Lang, ACADEMIC_STATUS_OPTIONS, AcademicStatus } from "../types";

interface Step1PersonalProps {
  form: FormData;
  onChange: (fields: Partial<FormData>) => void;
  errors: Errors;
  lang: Lang;
}

const UNIVERSITIES_SUGGESTIONS = [
  "Trường Đại học Bách Khoa - ĐHQG TP.HCM (HCMUT)",
  "Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM (UIT)",
  "Trường Đại học Khoa học Tự nhiên - ĐHQG TP.HCM (HCMUS)",
  "Trường Đại học Quốc Tế - ĐHQG TP.HCM (IU)",
  "Trường Đại học Kinh tế - Luật - ĐHQG TP.HCM (UEL)",
  "Trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE)",
  "Trường Đại học Ngoại thương CS2 (FTU2)",
  "Trường Đại học Kinh tế TP.HCM (UEH)",
  "Trường Đại học Tôn Đức Thắng (TDTU)",
  "Trường Đại học FPT",
];

const inputBase =
  "w-full bg-white dark:bg-slate-900/90 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all";
const inputNormal = "border-slate-200 dark:border-slate-700/80 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
const inputError = "border-rose-400/80 dark:border-rose-500/80 focus:ring-2 focus:ring-rose-500/30";

export const Step1Personal: React.FC<Step1PersonalProps> = ({ form, onChange, errors, lang }) => {
  const t = T[lang];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          {t.step1Header}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.step1Desc}</p>
      </div>

      {/* Confirmation Email */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          {t.emailConfirmation}
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
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            {t.fullName}
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
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            {t.phone}
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
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            {t.emailPersonal}
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
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            {t.emailSchool}
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
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          {t.facebookLink}
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

      {/* University + Faculty + MSSV */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            {t.university}
          </label>
          <input
            list="universities-list"
            type="text"
            value={form.university}
            onChange={(e) => onChange({ university: e.target.value })}
            placeholder={t.universityPh}
            className={`${inputBase} ${errors.university ? inputError : inputNormal}`}
          />
          <datalist id="universities-list">
            {UNIVERSITIES_SUGGESTIONS.map((uni) => <option key={uni} value={uni} />)}
          </datalist>
          {errors.university && <p className="text-xs text-rose-500 mt-1">{errors.university}</p>}
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            {t.faculty}
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

        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
            <IdCard className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            {t.studentId}
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
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          {t.academicStatus}
        </label>

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
          <div className="mt-3 animate-in fade-in duration-200">
            <input
              type="text"
              value={form.academicStatusOther}
              onChange={(e) => onChange({ academicStatusOther: e.target.value })}
              placeholder={t.academicStatusOtherPh}
              className={`${inputBase} ${inputNormal}`}
            />
          </div>
        )}

        {errors.academicStatus && <p className="text-xs text-rose-500 mt-1.5">{errors.academicStatus}</p>}
      </div>
    </div>
  );
};
