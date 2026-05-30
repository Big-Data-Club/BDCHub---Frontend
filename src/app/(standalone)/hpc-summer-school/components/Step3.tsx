import React, { useRef } from "react";
import { FormData, Errors, Translation } from "../types";
import { FL, Err, FIn, FTa, FSel } from "./FormFields";

interface Step3Props {
  t: Translation;
  data: FormData;
  errors: Errors;
  onChange: (f: keyof FormData, v: string) => void;
  onFileChange: (file: File) => void;
  uploadingCv: boolean;
}

export function Step3({
  t,
  data,
  errors,
  onChange,
  onFileChange,
  uploadingCv,
}: Step3Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const showOther = data.source === "Other" || data.source === "Khác";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-0.5">{t.step3Title}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t.step3Desc}</p>
      </div>

      {/* CV Upload */}
      <div className="group/cv">
        <FL req>{t.cvLabel}</FL>
        <div
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFileChange(f); }}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 transform active:scale-[0.99]
            ${errors.cvFile
              ? "border-red-400 dark:border-red-600/60 bg-red-50/40 dark:bg-red-950/10 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
              : data.cvUrl
                ? "border-cyan-400 dark:border-cyan-500 bg-cyan-50/30 dark:bg-cyan-950/10 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-cyan-50/20 dark:hover:bg-cyan-950/5"}`}
        >
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange(f); }} />
          {uploadingCv ? (
            <div className="space-y-3 py-2">
              <div className="w-9 h-9 border-4 border-slate-200 dark:border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto" />
              <p className="text-cyan-600 dark:text-cyan-400 font-semibold text-sm animate-pulse">{t.cvUploading}</p>
            </div>
          ) : data.cvUrl ? (
            <div className="space-y-2 py-1">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center mx-auto shadow-sm shadow-cyan-500/20">
                <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">{data.cvFile?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.cvSuccess}</p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto group-hover/cv:bg-cyan-50 dark:group-hover/cv:bg-cyan-950/20 group-hover/cv:scale-110 transition-all duration-300 shadow-sm">
                <svg className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover/cv:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold">
                {t.cvDrag} <span className="text-cyan-600 dark:text-cyan-400 hover:underline">{t.cvClick}</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{t.cvHint}</p>
            </div>
          )}
        </div>
        <Err msg={errors.cvFile} />
      </div>

      <div>
        <FL req>{t.researchLabel}</FL>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">{t.researchHint}</p>
        <FTa rows={3} placeholder={t.researchPh} value={data.researchInterests} onChange={e => onChange("researchInterests", e.target.value)} error={errors.researchInterests} />
      </div>

      <div>
        <FL req>{t.motivationLabel}</FL>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">{t.motivationHint}</p>
        <FTa rows={4} placeholder={t.motivationPh} value={data.motivation} onChange={e => onChange("motivation", e.target.value)} error={errors.motivation} />
      </div>

      <div>
        <FL>{t.pubLabel}</FL>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">{t.pubHint}</p>
        <FTa rows={5} placeholder={t.pubPh} value={data.publications} onChange={e => onChange("publications", e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div><FL>{t.achievementsLabel}</FL><FTa rows={3} placeholder={t.achievementsPh} value={data.achievements} onChange={e => onChange("achievements", e.target.value)} /></div>
        <div><FL>{t.futurePlansLabel}</FL><FTa rows={3} placeholder={t.futurePlansPh} value={data.futurePlans} onChange={e => onChange("futurePlans", e.target.value)} /></div>
      </div>

      {/* How did you hear about us */}
      <div className="border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/20 rounded-2xl p-5 space-y-4 shadow-inner-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/10">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.sourceTitle}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.sourceDesc}</p>
          </div>
        </div>
        <div className="space-y-4 pt-1">
          <div className={`relative transition-all duration-300 space-y-3.5 ${
            showOther
              ? "pl-4.5 border-l-2 border-cyan-500/60 dark:border-cyan-500/40"
              : "pl-0 border-l-0 border-transparent"
          }`}>
            <div>
              <FL>{t.sourceLabel}</FL>
              <FSel
                value={data.source}
                onChange={v => onChange("source", v)}
                options={t.sourceOptions as any}
                placeholder={t.sourcePh}
                isVi={t.langToggle === "English"}
              />
            </div>
            {showOther && (
              <div className="animate-fadeIn">
                <FL>{t.sourceOtherLabel}</FL>
                <FIn type="text" placeholder={t.sourceOtherPh} value={data.sourceOther} onChange={e => onChange("sourceOther", e.target.value)} error={errors.sourceOther} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
