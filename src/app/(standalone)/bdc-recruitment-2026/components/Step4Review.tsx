"use client";

import React from "react";
import { CheckCircle2, User, BookOpen, Users, FileText, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { FormData, Errors, T, Lang, ACADEMIC_STATUS_OPTIONS, DEPARTMENT_OPTIONS } from "../types";

interface Step4ReviewProps {
  form: FormData;
  onChange: (fields: Partial<FormData>) => void;
  errors: Errors;
  lang: Lang;
  onEditStep: (stepNumber: number) => void;
}

export const Step4Review: React.FC<Step4ReviewProps> = ({ form, onChange, errors, lang, onEditStep }) => {
  const t = T[lang];

  const statusLabel =
    ACADEMIC_STATUS_OPTIONS.find((s) => s.id === form.academicStatus)?.[
      lang === "vi" ? "labelVi" : "labelEn"
    ] || form.academicStatus;

  const deptObj = DEPARTMENT_OPTIONS.find((d) => d.id === form.department);
  const deptName = deptObj ? (lang === "vi" ? deptObj.nameVi : deptObj.nameEn) : form.department;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-400" />
          {t.step4Header}
        </h2>
        <p className="text-sm text-slate-400 mt-1">{t.step4Desc}</p>
      </div>

      {/* Review Section 1: Personal Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            {t.reviewPersonal}
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-xs text-blue-400 hover:underline font-medium"
          >
            Chỉnh sửa
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">{t.fullName}:</span>
            <span className="font-semibold text-slate-100">{form.fullName || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.phone}:</span>
            <span className="font-semibold text-slate-100">{form.phone || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.emailConfirmation}:</span>
            <span className="font-semibold text-slate-100">{form.emailConfirmation || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.emailPersonal}:</span>
            <span className="font-semibold text-slate-100">{form.emailPersonal || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.emailSchool}:</span>
            <span className="font-semibold text-slate-100">{form.emailSchool || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.facebookLink}:</span>
            <a
              href={form.facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-400 hover:underline truncate block"
            >
              {form.facebookLink || "—"}
            </a>
          </div>
          <div>
            <span className="text-slate-400 block">{t.university}:</span>
            <span className="font-semibold text-slate-100">{form.university || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.faculty}:</span>
            <span className="font-semibold text-slate-100">{form.faculty || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.studentId}:</span>
            <span className="font-semibold text-slate-100">{form.studentId || "Chưa cập nhật"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.academicStatus}:</span>
            <span className="font-semibold text-blue-300">{statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Review Section 2: Academic & Files */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {t.reviewAcademic}
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-xs text-blue-400 hover:underline font-medium"
          >
            Chỉnh sửa
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {form.academicStatus === "freshman" ? (
            <div>
              <span className="text-slate-400 block">{t.thptDgnlScores}:</span>
              <span className="font-semibold text-slate-100">{form.thptDgnlScores || "—"}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">{t.gpaCumulative}:</span>
                <span className="font-semibold text-slate-100">{form.gpaCumulative || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.gpaLatest}:</span>
                <span className="font-semibold text-slate-100">{form.gpaLatest || "—"}</span>
              </div>
            </div>
          )}

          <div>
            <span className="text-slate-400 block">{t.achievementsExtracurricular}:</span>
            <p className="text-slate-200 mt-0.5 whitespace-pre-wrap">{form.achievementsExtracurricular || "Chưa có"}</p>
          </div>

          <div>
            <span className="text-slate-400 block">{t.englishCert}:</span>
            <span className="font-semibold text-slate-100">{form.englishCert || "Chưa có"}</span>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-400 block mb-1">File CV đính kèm (Cloudinary):</span>
            {form.cvFile ? (
              <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="font-medium truncate">{form.cvFile.filename}</span>
                <a
                  href={form.cvFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-blue-400 hover:underline flex items-center gap-1 shrink-0"
                >
                  Xem <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <span className="text-rose-400 font-medium">Chưa tải CV</span>
            )}
          </div>

          {form.evidenceFiles.length > 0 && (
            <div>
              <span className="text-slate-400 block mb-1">File minh chứng đính kèm ({form.evidenceFiles.length}):</span>
              <div className="space-y-1">
                {form.evidenceFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-800/60 px-3 py-1.5 rounded-lg text-slate-300">
                    <span className="truncate">{file.filename}</span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
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

      {/* Review Section 3: Department & Motivation */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t.reviewDepartment}
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-xs text-blue-400 hover:underline font-medium"
          >
            Chỉnh sửa
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-slate-400 block">{t.deptSelectLabel}:</span>
            <span className="font-bold text-blue-300 text-sm">{deptName || "Chưa lựa chọn"}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">{t.motivationLabel}:</span>
            <p className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-slate-200 whitespace-pre-wrap leading-relaxed">
              {form.motivation || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Commitment & Privacy Checkbox */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl space-y-2">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="agreePrivacy"
            checked={form.agreePrivacy}
            onChange={(e) => onChange({ agreePrivacy: e.target.checked })}
            className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500/30 cursor-pointer"
          />
          <label htmlFor="agreePrivacy" className="text-xs text-slate-200 leading-relaxed font-medium cursor-pointer">
            <span className="font-bold text-blue-300 flex items-center gap-1.5 inline-flex mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-400 inline" /> Cam kết thông tin:
            </span>{" "}
            {t.agreePrivacyLabel}
          </label>
        </div>

        {errors.agreePrivacy && (
          <div className="flex items-center space-x-2 text-xs text-rose-400 pt-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.agreePrivacy}</span>
          </div>
        )}
      </div>
    </div>
  );
};
