"use client";

import React from "react";
import { Users, Code, Check, Clock, Shuffle } from "lucide-react";
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

  return (
    <div className="space-y-8">
      {/* Header section with refined editorial divider */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          {t.step3Header}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.step3Desc}</p>
      </div>

      {/* Department Selection Cards (NV1) */}
      <div>
        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
          {t.deptSelectLabel}
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t.deptSelectHint}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {DEPARTMENT_OPTIONS.map((dept) => {
            const isSelected = form.department === dept.id;
            const isRd = dept.id === "rd";
            const IconComponent = isRd ? Code : Users;
            const highlights = lang === "vi" ? dept.highlightsVi : dept.highlightsEn;

            return (
              <div
                key={dept.id}
                onClick={() => onChange({ department: dept.id as DepartmentId })}
                className={`group relative p-6 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-50/60 dark:bg-blue-950/25 border-blue-600 dark:border-blue-500"
                    : "bg-white dark:bg-[#070E1B] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2 leading-snug">
                      <IconComponent className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{lang === "vi" ? dept.nameVi : dept.nameEn}</span>
                    </h3>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 mt-1 ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 dark:border-slate-700 bg-transparent group-hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-3 leading-snug">
                    {lang === "vi" ? dept.taglineVi : dept.taglineEn}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-4">
                    {lang === "vi" ? dept.descriptionVi : dept.descriptionEn}
                  </p>

                  <div className="pl-3 border-l-2 border-slate-300 dark:border-slate-700 space-y-1.5 mb-5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      {lang === "vi" ? "Cơ hội chính:" : "Key Opportunities:"}
                    </p>
                    <ul className="space-y-1.5">
                      {highlights.map((item, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-snug">
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="font-semibold uppercase text-slate-400 mr-1.5">Tech:</span>
                    {(lang === "vi" ? dept.skillsVi : dept.skillsEn).join(" · ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {errors.department && <p className="text-xs text-rose-500 mt-2">{errors.department}</p>}
      </div>

      {/* HR Adjustment Consent */}
      <div className="pt-2">
        <FCb
          id="allowAdjustment"
          checked={form.allowDepartmentAdjustment ?? true}
          onCheckedChange={(c) => onChange({ allowDepartmentAdjustment: c })}
          icon={<Shuffle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
          label={t.allowDeptAdjustmentLabel}
          description={
            isVi
              ? "Nếu Ban ứng tuyển ban đầu của bạn đã đủ chỉ tiêu hoặc Ban Nhân sự nhận thấy hồ sơ của bạn phù hợp hơn với Ban còn lại, BDC sẽ chủ động cân nhắc trao cơ hội cho bạn ở Ban đó."
              : "If your primary department choice reaches capacity, BDC HR may consider evaluating your application for the other department."
          }
        />
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Time Commitment */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          {t.weeklyTimeCommitmentLabel}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIME_COMMITMENT_OPTIONS.map((opt) => {
            const isSelected = (form.weeklyTimeCommitment || "5_to_10h") === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => onChange({ weeklyTimeCommitment: opt.id })}
                className={`p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                  isSelected
                    ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-100"
                    : "bg-white dark:bg-[#070E1B] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                {isVi ? opt.labelVi : opt.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Motivation Statement */}
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className={`text-xs font-medium ml-auto ${form.motivation.length > 500 ? "text-amber-500 font-bold" : "text-slate-400 dark:text-slate-500"}`}>
            {form.motivation.length} ký tự
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.motivationHint}</p>
        <FTa
          label={t.motivationLabel}
          rows={5}
          value={form.motivation}
          onChange={(e) => onChange({ motivation: e.target.value })}
          placeholder={t.motivationPh}
          error={errors.motivation}
        />
      </div>

      {/* Send Copy via Email Option */}
      <div className="pt-2">
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


