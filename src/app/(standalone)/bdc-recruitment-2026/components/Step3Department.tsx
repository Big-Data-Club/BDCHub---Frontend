"use client";

import React from "react";
import { Users, Code, Check, Clock, Lightbulb } from "lucide-react";
import { FormData, Errors, T, Lang, DEPARTMENT_OPTIONS, DepartmentId, TIME_COMMITMENT_OPTIONS } from "../types";
import { FTa, FCb } from "@/components/form/FormFields";

interface Step3DepartmentProps {
  form: FormData;
  onChange: (fields: Partial<FormData>) => void;
  errors: Errors;
  lang: Lang;
}

export const Step3Department: React.FC<Step3DepartmentProps> = ({ form, onChange, errors, lang }) => {
  const t = T[lang];
  const isVi = lang === "vi";

  const handleInsertChip = (chipText: string) => {
    const current = form.motivation.trim();
    if (!current) {
      onChange({ motivation: `- ${chipText}: ` });
      return;
    }
    if (current.includes(chipText)) return;
    onChange({ motivation: `${current}\n- ${chipText}: ` });
  };

  return (
    <div className="space-y-8">
      {/* Header section with refined editorial divider */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          {t.step3Header}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.step3Desc}</p>
      </div>

      {/* Department Selection - Minimalist Editorial Grid */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            {t.deptSelectLabel}
          </label>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">{t.deptSelectHint}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEPARTMENT_OPTIONS.map((dept) => {
            const isSelected = form.department === dept.id;
            const isRd = dept.id === "rd";
            const IconComponent = isRd ? Code : Users;
            const highlights = isVi ? dept.highlightsVi : dept.highlightsEn;
            const fitTitle = isVi ? dept.fitTitleVi : dept.fitTitleEn;
            const badge = isVi ? dept.badgeVi : dept.badgeEn;

            return (
              <div
                key={dept.id}
                onClick={() => onChange({ department: dept.id as DepartmentId })}
                className={`group cursor-pointer transition-all duration-200 flex flex-col justify-between p-6 rounded-2xl border active:scale-[0.99] ${
                  isSelected
                    ? "bg-blue-50/60 dark:bg-[#0D192E] border-blue-600 dark:border-cyan-400 shadow-sm ring-1 ring-blue-600/20 dark:ring-cyan-400/20"
                    : "bg-white dark:bg-[#0D192E]/60 border-slate-200 dark:border-blue-500/10 hover:border-slate-300 dark:hover:border-blue-500/30 hover:shadow-xs"
                }`}
              >
                <div>
                  {/* Category Indicator & Radio check mark */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${isSelected ? "text-blue-600 dark:text-cyan-400" : "text-slate-400 dark:text-slate-500"}`} />
                      <span className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                        {badge}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                        isSelected
                          ? "border-blue-600 dark:border-cyan-400 bg-blue-600 dark:bg-cyan-400 text-white dark:text-slate-950"
                          : "border-slate-300 dark:border-slate-700 bg-transparent group-hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors leading-snug mb-1">
                    {isVi ? dept.nameVi : dept.nameEn}
                  </h3>

                  <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 mb-3 leading-snug">
                    {isVi ? dept.taglineVi : dept.taglineEn}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {isVi ? dept.descriptionVi : dept.descriptionEn}
                  </p>

                  {/* Pure Editorial Left Divider for Fit Highlights */}
                  <div className="border-l-2 border-blue-500/40 dark:border-cyan-400/40 pl-3 py-0.5 space-y-1.5 mb-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {fitTitle}
                    </p>
                    <ul className="space-y-1">
                      {highlights.map((item, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {errors.department && <p className="text-xs font-semibold text-rose-500 mt-2">{errors.department}</p>}
      </div>

      <hr className="border-slate-200 dark:border-blue-500/10" />

      {/* Time Commitment */}
      <div>
        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          {t.weeklyTimeCommitmentLabel}
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {isVi
            ? "Đảm bảo thời gian sinh hoạt CLB không ảnh hưởng đến việc học chính khóa tại Đại học."
            : "Ensure club participation fits around your university study schedule."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIME_COMMITMENT_OPTIONS.map((opt) => {
            const isSelected = (form.weeklyTimeCommitment || "5_to_10h") === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => onChange({ weeklyTimeCommitment: opt.id })}
                className={`p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 flex items-center justify-between min-h-[44px] ${
                  isSelected
                    ? "bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 border-blue-600 dark:border-cyan-500 shadow-sm font-bold"
                    : "bg-white dark:bg-[#0D192E] border-slate-200 dark:border-blue-500/20 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-blue-500/40"
                }`}
              >
                <span>{isVi ? opt.labelVi : opt.labelEn}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSelected ? "bg-white dark:bg-slate-950 animate-pulse" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Motivation Statement with Prompt Chips */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            {t.motivationLabel}
          </label>
          <span
            className={`text-xs font-mono font-medium ${
              form.motivation.length > 500 ? "text-amber-500 font-bold" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {form.motivation.length} ký tự
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t.motivationHint}</p>

        {/* Prompt chips (Temporarily hidden) */}
        {/* {t.motivationChips && (
          <div className="mb-3 space-y-1.5">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              {t.motivationChipsLabel}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {t.motivationChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertChip(chip)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        )} */}

        <FTa
          label=""
          rows={5}
          value={form.motivation}
          onChange={(e) => onChange({ motivation: e.target.value })}
          placeholder={t.motivationPh}
          error={errors.motivation}
        />
      </div>

      {/* Send Copy via Email Option */}
      <div className="pt-1">
        <FCb
          id="sendCopy"
          checked={form.sendCopy}
          onCheckedChange={(c) => onChange({ sendCopy: c })}
          label={`${t.sendCopyLabel} (${form.emailConfirmation || "email xác nhận"})`}
        />
      </div>
    </div>
  );
};
