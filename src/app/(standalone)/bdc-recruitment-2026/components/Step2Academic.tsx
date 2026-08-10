"use client";

import React from "react";
import { BookOpen, Award, FileText, Sparkles, FileCheck, Layers } from "lucide-react";
import { FormData, Errors, T, Lang } from "../types";
import { FileUploadCloudinary } from "./FileUploadCloudinary";

interface Step2AcademicProps {
  form: FormData;
  onChange: (fields: Partial<FormData>) => void;
  errors: Errors;
  lang: Lang;
}

export const Step2Academic: React.FC<Step2AcademicProps> = ({ form, onChange, errors, lang }) => {
  const t = T[lang];
  const isFreshman = form.academicStatus === "freshman";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          {t.step2Header}
        </h2>
        <p className="text-sm text-slate-400 mt-1">{t.step2Desc}</p>
      </div>

      {/* Notice Banner tailored to candidate status */}
      <div className="p-4 rounded-xl border bg-slate-900/80 backdrop-blur-sm border-blue-500/30 flex items-start space-x-3 shadow-lg">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0 border border-blue-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-blue-300">
            {isFreshman ? t.freshmanNoticeTitle : t.seniorNoticeTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {isFreshman ? t.freshmanNoticeDesc : t.seniorNoticeDesc}
          </p>
        </div>
      </div>

      {/* Dynamic Academic Inputs */}
      {isFreshman ? (
        /* Freshman Fields */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              {t.thptDgnlScores}
            </label>
            <input
              type="text"
              value={form.thptDgnlScores}
              onChange={(e) => onChange({ thptDgnlScores: e.target.value })}
              placeholder={t.thptDgnlScoresPh}
              className={`w-full bg-slate-900/90 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                errors.thptDgnlScores
                  ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/30"
                  : "border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
            />
            {errors.thptDgnlScores && <p className="text-xs text-rose-400 mt-1">{errors.thptDgnlScores}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-400" />
              {t.achievementsExtracurricular}
            </label>
            <textarea
              rows={3}
              value={form.achievementsExtracurricular}
              onChange={(e) => onChange({ achievementsExtracurricular: e.target.value })}
              placeholder={t.achievementsExtracurricularPh}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              {t.englishCert}
            </label>
            <input
              type="text"
              value={form.englishCert}
              onChange={(e) => onChange({ englishCert: e.target.value })}
              placeholder={t.englishCertPh}
              className={`w-full bg-slate-900/90 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                errors.englishCert
                  ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/30"
                  : "border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
            />
            {errors.englishCert && <p className="text-xs text-rose-400 mt-1">{errors.englishCert}</p>}
          </div>
        </div>
      ) : (
        /* Senior Fields (Years 1, 2, 3...) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                {t.gpaCumulative}
              </label>
              <input
                type="text"
                value={form.gpaCumulative}
                onChange={(e) => onChange({ gpaCumulative: e.target.value })}
                placeholder={t.gpaCumulativePh}
                className={`w-full bg-slate-900/90 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                  errors.gpaCumulative
                    ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/30"
                    : "border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
              />
              {errors.gpaCumulative && <p className="text-xs text-rose-400 mt-1">{errors.gpaCumulative}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                {t.gpaLatest}
              </label>
              <input
                type="text"
                value={form.gpaLatest}
                onChange={(e) => onChange({ gpaLatest: e.target.value })}
                placeholder={t.gpaLatestPh}
                className={`w-full bg-slate-900/90 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                  errors.gpaLatest
                    ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/30"
                    : "border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
              />
              {errors.gpaLatest && <p className="text-xs text-rose-400 mt-1">{errors.gpaLatest}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-400" />
              {t.achievementsExtracurricular}
            </label>
            <textarea
              rows={3}
              value={form.achievementsExtracurricular}
              onChange={(e) => onChange({ achievementsExtracurricular: e.target.value })}
              placeholder={t.achievementsExtracurricularPh}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              {t.englishCert}
            </label>
            <input
              type="text"
              value={form.englishCert}
              onChange={(e) => onChange({ englishCert: e.target.value })}
              placeholder={t.englishCertPh}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      )}

      <hr className="border-slate-800" />

      {/* Cloudinary CV Upload */}
      <div>
        <FileUploadCloudinary
          label={t.cvUploadLabel}
          hint={t.cvUploadHint}
          accept="application/pdf"
          maxSizeMB={10}
          folder="bdc_recruitment_2026_cv"
          value={form.cvFile}
          onChange={(file) => onChange({ cvFile: file })}
          error={errors.cvFile}
          required
        />
      </div>

      {/* Supporting Evidence / Certificates Cloudinary Upload */}
      <div>
        <FileUploadCloudinary
          label={t.evidenceUploadLabel}
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
