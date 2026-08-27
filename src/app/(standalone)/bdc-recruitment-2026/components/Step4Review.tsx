"use client";

import React from "react";
import { CheckCircle2, User, BookOpen, Users, FileText, ExternalLink, ShieldCheck } from "lucide-react";
import { FormData, Errors, T, Lang, ACADEMIC_STATUS_OPTIONS, DEPARTMENT_OPTIONS, THPT_BLOCK_OPTIONS, TIME_COMMITMENT_OPTIONS } from "../types";
import { FCb } from "@/components/form/FormFields";

interface Step4ReviewProps {
  form: FormData;
  onChange: (fields: Partial<FormData>) => void;
  errors: Errors;
  lang: Lang;
  onEditStep: (stepNumber: number) => void;
}

export const Step4Review: React.FC<Step4ReviewProps> = ({ form, onChange, errors, lang, onEditStep }) => {
  const t = T[lang];
  const isVi = lang === "vi";

  const statusLabel =
    form.academicStatus === "other"
      ? (form.academicStatusOther || (isVi ? "Khác" : "Other"))
      : (ACADEMIC_STATUS_OPTIONS.find((s) => s.id === form.academicStatus)?.[isVi ? "labelVi" : "labelEn"] || form.academicStatus);

  const deptObj = DEPARTMENT_OPTIONS.find((d) => d.id === form.department);
  const deptName = deptObj ? (isVi ? deptObj.nameVi : deptObj.nameEn) : form.department;

  const blockObj = THPT_BLOCK_OPTIONS.find((b) => b.id === form.thptBlock);
  const blockLabel = form.thptBlock === "other"
    ? (form.thptBlockOther || (isVi ? "Khác" : "Other"))
    : (blockObj ? (isVi ? blockObj.labelVi : blockObj.labelEn) : (form.thptBlock || "A00"));

  const timeObj = TIME_COMMITMENT_OPTIONS.find((tc) => tc.id === form.weeklyTimeCommitment);
  const timeLabel = timeObj ? (isVi ? timeObj.labelVi : timeObj.labelEn) : (form.weeklyTimeCommitment || "5 - 10h/tuần");

  const reviewSection =
    "space-y-3 p-4 sm:p-5 bg-slate-50/50 dark:bg-[#0D192E]/40 border border-slate-200 dark:border-blue-500/10 rounded-2xl";
  const reviewHeader =
    "flex justify-between items-center pb-2 border-b border-slate-200/80 dark:border-blue-500/10";
  const reviewTitle =
    "text-sm font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-2";
  const labelCls = "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 block";
  const valueCls = "font-semibold text-slate-900 dark:text-slate-100 text-xs tabular-nums";

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-blue-500/10 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-cyan-400 shrink-0" />
          {t.step4Header}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.step4Desc}</p>
      </div>

      {/* Section 1: Personal Info */}
      <div className={reviewSection}>
        <div className={reviewHeader}>
          <h3 className={reviewTitle}>
            <User className="w-4 h-4" />
            {t.reviewPersonal}
          </h3>
          <button type="button" onClick={() => onEditStep(1)} className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer transition-colors">
            Chỉnh sửa
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          {[
            [t.fullName, form.fullName],
            [t.phone, form.phone],
            [t.emailConfirmation, form.emailConfirmation],
            [t.emailPersonal, form.emailPersonal],
            [t.emailSchool, form.emailSchool || (isVi ? "Chưa cấp (Bỏ qua)" : "Not issued")],
            [t.university, form.university],
            [t.faculty, form.faculty],
            [t.studentId, form.studentId || (isVi ? "Chưa cập nhật" : "N/A")],
          ].map(([label, value]) => (
            <div key={label}>
              <span className={labelCls}>{label}:</span>
              <span className={valueCls}>{value || "—"}</span>
            </div>
          ))}

          <div>
            <span className={labelCls}>{t.facebookLink}:</span>
            <a
              href={form.facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 dark:text-cyan-400 hover:underline truncate block"
            >
              {form.facebookLink || "—"}
            </a>
          </div>

          <div>
            <span className={labelCls}>{t.academicStatus}:</span>
            <span className="font-semibold text-blue-600 dark:text-cyan-400">{statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Academic & Files */}
      <div className={reviewSection}>
        <div className={reviewHeader}>
          <h3 className={reviewTitle}>
            <BookOpen className="w-4 h-4" />
            {t.reviewAcademic}
          </h3>
          <button type="button" onClick={() => onEditStep(2)} className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer transition-colors">
            Chỉnh sửa
          </button>
        </div>

        <div className="space-y-4 text-xs pt-1">
          {form.academicStatus === "freshman" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className={labelCls}>Tổ hợp xét tuyển:</span>
                <span className={valueCls}>{blockLabel}</span>
              </div>
              <div>
                <span className={labelCls}>Điểm THPT / Xét tuyển:</span>
                <span className={valueCls}>{form.thptScore || "—"}</span>
              </div>
              <div>
                <span className={labelCls}>Điểm thi ĐGNL:</span>
                <span className={valueCls}>
                  {form.hasDgnl === "no" ? (isVi ? "Không thi ĐGNL" : "No ĐGNL") : (form.dgnlScore || "—")}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={labelCls}>{t.gpaCumulative}:</span>
                <span className={valueCls}>{form.gpaCumulative || "—"}</span>
              </div>
              <div>
                <span className={labelCls}>{t.gpaLatest}:</span>
                <span className={valueCls}>{form.gpaLatest || "—"}</span>
              </div>
            </div>
          )}

          <div>
            <span className={labelCls}>{t.achievementsExtracurricular}:</span>
            <p className="text-slate-800 dark:text-slate-200 mt-0.5 whitespace-pre-wrap leading-relaxed">{form.achievementsExtracurricular || "Chưa có"}</p>
          </div>

          <div>
            <span className={labelCls}>{t.englishCert}:</span>
            <span className={valueCls}>{form.englishCert || "Chưa có"}</span>
          </div>

          <div className="pt-2 border-t border-slate-200/80 dark:border-blue-500/10 space-y-2">
            <span className={labelCls}>Hồ sơ CV:</span>
            {form.cvFile ? (
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/20 p-2.5 rounded-xl">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="font-semibold truncate">{form.cvFile.filename}</span>
                <a
                  href={form.cvFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 shrink-0 font-semibold"
                >
                  Xem <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : form.cvBioText ? (
              <div className="bg-slate-50 dark:bg-[#0D192E] p-3 rounded-xl border border-slate-200 dark:border-blue-500/10">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Tóm tắt bản thân / Dự án thay thế CV:</span>
                <p className="text-slate-800 dark:text-slate-200 text-xs whitespace-pre-wrap leading-relaxed">{form.cvBioText}</p>
              </div>
            ) : (
              <span className="text-rose-500 font-semibold">Chưa tải CV</span>
            )}
          </div>

          {form.evidenceFiles.length > 0 && (
            <div>
              <span className={labelCls}>File minh chứng đính kèm ({form.evidenceFiles.length}):</span>
              <div className="space-y-1.5 pt-1">
                {form.evidenceFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50/70 dark:bg-[#0D192E] px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-blue-500/10">
                    <span className="truncate">{file.filename}</span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 shrink-0 ml-2 font-semibold"
                    >
                      Xem <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Department & Motivation */}
      <div className={reviewSection}>
        <div className={reviewHeader}>
          <h3 className={reviewTitle}>
            <Users className="w-4 h-4" />
            {t.reviewDepartment}
          </h3>
          <button type="button" onClick={() => onEditStep(3)} className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer transition-colors">
            Chỉnh sửa
          </button>
        </div>

        <div className="space-y-4 text-xs pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className={labelCls}>Ban ứng tuyển:</span>
              <span className="font-bold text-blue-600 dark:text-cyan-400 text-sm">{deptName || "Chưa lựa chọn"}</span>
            </div>
            <div>
              <span className={labelCls}>{isVi ? "Thời gian sẵn sàng hoạt động:" : "Available time:"}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{timeLabel}</span>
            </div>
          </div>

          <div>
            <span className={labelCls}>{t.motivationLabel}:</span>
            <p className="bg-white dark:bg-[#0D192E] p-3.5 rounded-xl border border-slate-200 dark:border-blue-500/10 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed mt-1">
              {form.motivation || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Checkbox */}
      <div className="p-4.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 rounded-2xl">
        <FCb
          id="agreePrivacy"
          checked={form.agreePrivacy}
          onCheckedChange={(c) => onChange({ agreePrivacy: c })}
          icon={<ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400 inline shrink-0" />}
          label={
            <span className="leading-relaxed">
              <span className="font-bold text-blue-600 dark:text-cyan-400">Cam kết thông tin: </span>
              {t.agreePrivacyLabel}
            </span>
          }
          error={errors.agreePrivacy}
        />
      </div>
    </div>
  );
};


