"use client";

import React from "react";
import { Users, Code, MessageSquare, Check, Sparkles, Send } from "lucide-react";
import { FormData, Errors, T, Lang, DEPARTMENT_OPTIONS, DepartmentId } from "../types";

interface Step3DepartmentProps {
  form: FormData;
  onChange: (fields: Partial<FormData>) => void;
  errors: Errors;
  lang: Lang;
}

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

export const Step3Department: React.FC<Step3DepartmentProps> = ({ form, onChange, errors, lang }) => {
  const t = T[lang];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-200/80 dark:border-blue-500/15 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-cyan-500/20">
            <Users className="w-5 h-5" />
          </div>
          {t.step3Header}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{t.step3Desc}</p>
      </div>

      {/* Department Selection Cards */}
      <div>
        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
          {renderLabel(t.deptSelectLabel)}
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t.deptSelectHint}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DEPARTMENT_OPTIONS.map((dept) => {
            const isSelected = form.department === dept.id;
            const isRd = dept.id === "rd";
            const IconComponent = isRd ? Code : Users;

            return (
              <div
                key={dept.id}
                onClick={() => onChange({ department: dept.id as DepartmentId })}
                className={`group relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-50/80 dark:bg-[#0F1E35] border-blue-500 dark:border-cyan-400 shadow-[0_0_25px_rgba(59,130,246,0.2)] dark:shadow-[0_0_25px_rgba(34,211,238,0.25)] ring-2 ring-blue-500/30 dark:ring-cyan-400/40"
                    : "bg-white dark:bg-[#0D192E] border-slate-200 dark:border-blue-500/15 hover:border-blue-300 dark:hover:border-blue-500/30 hover:bg-slate-50 dark:hover:bg-[#0F1E35] shadow-sm dark:shadow-none"
                }`}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-600 dark:bg-cyan-400 text-white dark:text-slate-950 flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                <div>
                  {/* Badge */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`p-2.5 rounded-xl border ${
                      isRd
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
                        : "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20"
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      isRd
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-500/30"
                        : "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-500/30"
                    }`}>
                      {lang === "vi" ? dept.badgeVi : dept.badgeEn}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    {lang === "vi" ? dept.nameVi : dept.nameEn}
                  </h3>
                  <p className="text-xs font-medium text-blue-500 dark:text-blue-400/90 mt-1">
                    {lang === "vi" ? dept.taglineVi : dept.taglineEn}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3">
                    {lang === "vi" ? dept.descriptionVi : dept.descriptionEn}
                  </p>
                </div>

                {/* Skill Pills */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    {lang === "vi" ? "Kỹ năng & Lĩnh vực:" : "Skills & Focus:"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(lang === "vi" ? dept.skillsVi : dept.skillsEn).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {errors.department && <p className="text-xs text-rose-500 mt-2">{errors.department}</p>}
      </div>

      {/* Motivation Statement */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
          {renderLabel(t.motivationLabel)}
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.motivationHint}</p>
        <textarea
          rows={5}
          value={form.motivation}
          onChange={(e) => onChange({ motivation: e.target.value })}
          placeholder={t.motivationPh}
          className={`w-full bg-white dark:bg-slate-900/90 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all ${
            errors.motivation
              ? "border-rose-400/80 dark:border-rose-500/80 focus:ring-2 focus:ring-rose-500/30"
              : "border-slate-200 dark:border-slate-700/80 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          }`}
        />
        {errors.motivation && <p className="text-xs text-rose-500 mt-1">{errors.motivation}</p>}
      </div>

      {/* Send Copy via Email Option */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center space-x-3">
        <input
          type="checkbox"
          id="sendCopy"
          checked={form.sendCopy}
          onChange={(e) => onChange({ sendCopy: e.target.checked })}
          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-500 focus:ring-blue-500/30"
        />
        <label htmlFor="sendCopy" className="text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
          {t.sendCopyLabel} ({form.emailConfirmation || "email cá nhân"})
        </label>
      </div>
    </div>
  );
};
