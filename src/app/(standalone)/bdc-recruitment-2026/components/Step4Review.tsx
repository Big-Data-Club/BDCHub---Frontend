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

  const reviewCard =
    "bg-white dark:bg-[#070E1B] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3";
  const reviewHeader =
    "flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3";
  const reviewTitle =
    "text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2";
  const labelCls = "text-slate-500 dark:text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-0.5";
  const valueCls = "font-semibold text-slate-800 dark:text-slate-200 text-xs";

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          {t.step4Header}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.step4Desc}</p>
      </div>

      {/* Section 1: Personal Info */}
      <div className={reviewCard}>
        <div className={reviewHeader}>
          <h3 className={reviewTitle}>
            <User className="w-4 h-4" />
            {t.reviewPersonal}
          </h3>
          <button type="button" onClick={() => onEditStep(1)} className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-medium">
            Chỉnh sửa
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
              className="font-medium text-blue-500 dark:text-blue-400 hover:underline truncate block"
            >
              {form.facebookLink || "—"}
            </a>
          </div>

          <div>
            <span className={labelCls}>{t.academicStatus}:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-300">{statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Academic & Files */}
      <div className={reviewCard}>
        <div className={reviewHeader}>
          <h3 className={reviewTitle}>
            <BookOpen className="w-4 h-4" />
            {t.reviewAcademic}
          </h3>
          <button type="button" onClick={() => onEditStep(2)} className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-medium">
            Chỉnh sửa
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {form.academicStatus === "freshman" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
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
            <p className="text-slate-700 dark:text-slate-200 mt-0.5 whitespace-pre-wrap">{form.achievementsExtracurricular || "Chưa có"}</p>
          </div>

          <div>
            <span className={labelCls}>{t.englishCert}:</span>
            <span className={valueCls}>{form.englishCert || "Chưa có"}</span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className={`${labelCls} mb-1`}>Hồ sơ CV:</span>
            {form.cvFile ? (
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-2 rounded-lg">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="font-medium truncate">{form.cvFile.filename}</span>
                <a
                  href={form.cvFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
                >
                  Xem <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : form.cvBioText ? (
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">Tóm tắt bản thân / Dự án thay thế CV:</span>
                <p className="text-slate-700 dark:text-slate-300 text-xs whitespace-pre-wrap">{form.cvBioText}</p>
              </div>
            ) : (
              <span className="text-rose-500 font-medium">Chưa tải CV</span>
            )}
          </div>

          {form.evidenceFiles.length > 0 && (
            <div>
              <span className={`${labelCls} mb-1`}>File minh chứng đính kèm ({form.evidenceFiles.length}):</span>
              <div className="space-y-1">
                {form.evidenceFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-transparent">
                    <span className="truncate">{file.filename}</span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
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
      <div className={reviewCard}>
        <div className={reviewHeader}>
          <h3 className={reviewTitle}>
            <Users className="w-4 h-4" />
            {t.reviewDepartment}
          </h3>
          <button type="button" onClick={() => onEditStep(3)} className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-medium">
            Chỉnh sửa
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className={labelCls}>Ban ứng tuyển:</span>
              <span className="font-bold text-blue-600 dark:text-blue-300 text-sm">{deptName || "Chưa lựa chọn"}</span>
            </div>
            <div>
              <span className={labelCls}>Đồng ý điều phối Ban:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {form.allowDepartmentAdjustment ? (isVi ? "Có" : "Yes") : (isVi ? "Không" : "No")}
              </span>
            </div>
            <div>
              <span className={labelCls}>Thời gian cống hiến:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{timeLabel}</span>
            </div>
          </div>

          <div>
            <span className={`${labelCls} mb-1`}>{t.motivationLabel}:</span>
            <p className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {form.motivation || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Checkbox */}
      <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl">
        <FCb
          id="agreePrivacy"
          checked={form.agreePrivacy}
          onCheckedChange={(c) => onChange({ agreePrivacy: c })}
          icon={<ShieldCheck className="w-4 h-4 text-blue-500 dark:text-blue-400 inline shrink-0" />}
          label={
            <span className="leading-relaxed">
              <span className="font-bold text-blue-600 dark:text-blue-300">Cam kết thông tin: </span>
              {t.agreePrivacyLabel}
            </span>
          }
          error={errors.agreePrivacy}
        />
      </div>
    </div>
  );
};


