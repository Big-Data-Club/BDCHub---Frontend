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

export const Step3Department: React.FC<Step3DepartmentProps> = ({ form, onChange, errors, lang }) => {
  const t = T[lang];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          {t.step3Header}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.step3Desc}</p>
      </div>

      {/* Department Selection Cards */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          {t.deptSelectLabel}
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
                    ? "bg-blue-50 dark:bg-slate-900/90 border-blue-400 dark:border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)] dark:shadow-[0_0_30px_rgba(59,130,246,0.3)] ring-1 ring-blue-300 dark:ring-blue-500/50"
                    : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 shadow-sm dark:shadow-none"
                }`}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
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
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    {lang === "vi" ? "Kỹ năng & Lĩnh vực:" : "Skills & Focus:"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(lang === "vi" ? dept.skillsVi : dept.skillsEn).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60"
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
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          {t.motivationLabel}
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
        <label htmlFor="sendCopy" className="text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer flex items-center gap-2">
          <Send className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          {t.sendCopyLabel} ({form.emailConfirmation || "email cá nhân"})
        </label>
      </div>
    </div>
  );
};
