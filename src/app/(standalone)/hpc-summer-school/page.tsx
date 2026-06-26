"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

import hpcLogo from "@/assets/hpc-school-logo.png";

// ─── Shared Imports ───────────────────────────────────────────────────────────
import {
  Lang,
  FormData,
  Errors,
  ORGANIZERS,
  T,
  ALREADY_MSG,
} from "./types";

import { Step1 } from "./components/Step1";
import { Step2 } from "./components/Step2";
import { Step3 } from "./components/Step3";
import { Success } from "./components/Success";
import { AlreadySubmitted } from "./components/AlreadySubmitted";
import { Toast } from "./components/Toast";
import { ClosedForm } from "./components/ClosedForm";
import universitiesData from "./universities.json";

// ─── Main Page ─────────────────────────────────────────────────────────────────
const LS_DRAFT = "hpc_ss_2026_draft";
const LS_DONE  = "hpc_ss_2026_submitted";
const IS_CLOSED = true;

const EMPTY: FormData = {
  agreePrivacy: false, fullName: "", dob: "", studentId: "", emailUni: "",
  emailPersonal: "", phone: "", university: "", major: "", year: "", gpa: "",
  cvFile: null, cvUrl: "", researchInterests: "", publications: "",
  motivation: "", achievements: "", futurePlans: "", source: "", sourceOther: "",
};

export default function HPCSummerSchoolPage() {
  const [lang, setLang]                 = useState<Lang>("en");
  const t = T[lang];
  const [step, setStep]                 = useState(1);
  const [direction, setDirection]       = useState<"next" | "prev">("next");
  const [form, setForm]                 = useState<FormData>(EMPTY);
  const [errors, setErrors]             = useState<Errors>({});
  const [uploadingCv, setUploadingCv]   = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [savedName, setSavedName]       = useState("");
  const [draftRestored, setDraftRestored] = useState(false);
  const [scrolled, setScrolled]           = useState(false);

  // ── Scroll Listener for Sticky Header ──────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Mount: check submitted flag or restore draft ──────────────────────────
  useEffect(() => {
    try {
      const done = localStorage.getItem(LS_DONE);
      if (done) {
        const parsed = JSON.parse(done);
        setSavedName(parsed.name || "");
        setAlreadySubmitted(true);
        return;
      }
      const raw = localStorage.getItem(LS_DRAFT);
      if (raw) {
        const draft = JSON.parse(raw);
        setForm(prev => ({ ...prev, ...draft, cvFile: null, cvUrl: "" }));
        if (draft._step && draft._step > 1) setStep(draft._step);
        if (draft._lang) setLang(draft._lang as Lang);
        setDraftRestored(true);
      }
    } catch { /* ignore */ }
  }, []);

  // ── Auto-save draft (debounced 600 ms) ────────────────────────────────────
  useEffect(() => {
    if (submitted || alreadySubmitted) return;
    const timer = setTimeout(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cvFile, cvUrl, ...saveable } = form;
        localStorage.setItem(LS_DRAFT, JSON.stringify({ ...saveable, _step: step, _lang: lang }));
      } catch { /* ignore */ }
    }, 600);
    return () => clearTimeout(timer);
  }, [form, step, lang, submitted, alreadySubmitted]);

  // ── Translate localized fields when language changes ────────────────────────
  useEffect(() => {
    setForm(prev => {
      let updated = false;
      const newForm = { ...prev };

      // 1. Translate University
      if (newForm.university) {
        const found = universitiesData.find(
          uni => uni.labelVi === newForm.university || uni.labelEn === newForm.university
        );
        if (found && found.value !== "Other") {
          const expectedLabel = lang === "vi" ? found.labelVi : found.labelEn;
          if (newForm.university !== expectedLabel) {
            newForm.university = expectedLabel;
            updated = true;
          }
        }
      }

      // 2. Translate Year
      if (newForm.year) {
        const EN_YEARS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5+", "Graduate"];
        const VI_YEARS = ["Năm 1", "Năm 2", "Năm 3", "Năm 4", "Năm 5+", "Đã tốt nghiệp"];
        
        if (lang === "vi") {
          const idx = EN_YEARS.indexOf(newForm.year);
          if (idx !== -1) {
            newForm.year = VI_YEARS[idx];
            updated = true;
          }
        } else {
          const idx = VI_YEARS.indexOf(newForm.year);
          if (idx !== -1) {
            newForm.year = EN_YEARS[idx];
            updated = true;
          }
        }
      }

      // 3. Translate Source
      if (newForm.source) {
        const EN_SOURCES = [
          "HPCC Fanpage",
          "BDC Fanpage",
          "University Portal",
          "Friend Referral",
          "Faculty/Advisor",
          "Email Newsletter",
          "Other"
        ];
        const VI_SOURCES = [
          "Fanpage HPCC",
          "Fanpage BDC",
          "Cổng thông tin",
          "Bạn bè",
          "Giảng viên",
          "Email newsletter",
          "Khác"
        ];

        if (lang === "vi") {
          const idx = EN_SOURCES.indexOf(newForm.source);
          if (idx !== -1) {
            newForm.source = VI_SOURCES[idx];
            updated = true;
          }
        } else {
          const idx = VI_SOURCES.indexOf(newForm.source);
          if (idx !== -1) {
            newForm.source = EN_SOURCES[idx];
            updated = true;
          }
        }
      }

      return updated ? newForm : prev;
    });
  }, [lang]);

  const handleClear = () => {
    const msg = lang === "en"
      ? ALREADY_MSG.en.clearConfirm
      : ALREADY_MSG.vi.clearConfirm;
    if (!confirm(msg)) return;
    try { localStorage.removeItem(LS_DONE); localStorage.removeItem(LS_DRAFT); } catch { /* ignore */ }
    window.location.reload();
  };

  const set = (field: keyof FormData, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => { const e = { ...p }; delete e[field]; return e; });
  };

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") { setErrors(p => ({ ...p, cvFile: t.errCvType })); return; }
    if (file.size > 5 * 1024 * 1024)    { setErrors(p => ({ ...p, cvFile: t.errCvSize })); return; }
    setErrors(p => { const e = { ...p }; delete e.cvFile; return e; });
    setForm(p => ({ ...p, cvFile: file, cvUrl: "" }));
    setUploadingCv(true);
    try {
      const fd = new globalThis.FormData(); fd.append("file", file);
      const res = await fetch("/api/upload-cloudinary", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) setForm(p => ({ ...p, cvUrl: json.url }));
      else setErrors(p => ({ ...p, cvFile: json.message || t.errCvFailed }));
    } catch { setErrors(p => ({ ...p, cvFile: t.errCvFailed })); }
    finally { setUploadingCv(false); }
  };

  const validate = (stepNum = step) => {
    const e: Errors = {};
    if (stepNum === 1) { if (!form.agreePrivacy) e.agreePrivacy = t.privacyError; }
    else if (stepNum === 2) {
      if (!form.fullName.trim())   e.fullName   = t.errFullName;
      if (!form.studentId.trim())  e.studentId  = t.errStudentId;
      if (!form.emailUni.trim())   e.emailUni   = t.errEmailUni;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailUni)) e.emailUni = t.errEmailFmt;
      if (!form.phone.trim())      e.phone      = t.errPhone;
      if (!form.university.trim()) e.university = t.errUniversity;
      if (!form.major.trim())      e.major      = t.errMajor;
      if (!form.year)              e.year       = t.errYear;
      
      const [gpaNum, gpaSc] = form.gpa.split("/");
      if (!gpaNum || !gpaNum.trim()) {
        e.gpa = t.errGpa;
      } else if (gpaSc === undefined || !gpaSc.trim()) {
        e.gpa = t.errGpaScale;
      }
    } else {
      if (!form.cvUrl) e.cvFile = !form.cvFile ? t.errCvRequired : uploadingCv ? t.errCvUploading : t.errCvFailed;
      if (!form.researchInterests.trim()) e.researchInterests = t.errResearch;
      if (!form.motivation.trim())        e.motivation        = t.errMotivation;
    }
    setErrors(e); return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) { setDirection("next"); setStep(s => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const prev = () => { setDirection("prev"); setStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Capture client IP (non-critical - silently skip on failure)
      let clientIp = "Unknown";
      try {
        const ipRes  = await fetch("/api/get-ip");
        const ipJson = await ipRes.json();
        clientIp = ipJson.ip || "Unknown";
      } catch { /* ignore */ }

      const answers: Record<string, string> = {
        full_name: form.fullName, date_of_birth: form.dob, student_id: form.studentId,
        university_email: form.emailUni, personal_email: form.emailPersonal, phone: form.phone,
        university: form.university, major: form.major, year_of_study: form.year, gpa: form.gpa,
        cv_url: form.cvUrl, research_interests: form.researchInterests,
        publications: form.publications, motivation: form.motivation,
        achievements: form.achievements, future_plans: form.futurePlans,
        source: form.source, source_other: form.sourceOther,
        form_language: lang, client_ip: clientIp,
      };
      const res = await fetch("/api/submit-form", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: "hpc-summer-school-2026-participant",
          formTitle: "Application Form - HCMUT HPC School 2026",
          sheetName: "HPC_Summer_School_2026", formType: "registration",
          questions: Object.keys(answers).map(k => ({ id: k, question: k })),
          answers, submittedAt: new Date().toISOString(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Persist submission flag -> prevents re-submission from this browser
        try {
          localStorage.setItem(LS_DONE, JSON.stringify({ name: form.fullName, at: new Date().toISOString() }));
          localStorage.removeItem(LS_DRAFT);
        } catch { /* ignore */ }
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else throw new Error(json.message);
    } catch (err) { alert("❌ An error occurred. Please try again."); console.error(err); }
    finally { setSubmitting(false); }
  };

  const progressPct = Math.round(((step - 1) / (t.steps.length - 1)) * 100);

  return (
    <div className="w-full overflow-x-hidden pb-10 pt-20 sm:pt-24">
      {/* ── Fixed Sticky Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/50 shadow-sm py-3"
            : "bg-transparent py-3.5 sm:py-4.5"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="https://hpcc.hcmut.edu.vn/hpc-school"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-[90px] h-12 flex-shrink-0 transform hover:scale-[1.05] hover:rotate-1 transition-all duration-300 bg-white/60 dark:bg-white/60 backdrop-blur-md p-1.5 rounded-xl border border-slate-100 dark:border-white/20 shadow-sm block"
            >
              <div className="relative w-full h-full">
                <Image src={hpcLogo} alt="HCMUT HPC School" fill className="object-contain dark:brightness-110 dark:contrast-110" />
              </div>
            </a>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-tight truncate tracking-tight">
                {t.title.includes("2026") ? (
                  <>
                    {t.title.replace("2026", "")}
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-400">2026</span>
                  </>
                ) : (
                  t.title
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-semibold tracking-wide">{t.tagline}</p>
            </div>
          </div>

          {/* Right: org logos + theme + lang */}
          <div className="flex items-center gap-3.5 flex-shrink-0">
            {/* Org logos - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-3 bg-white/60 dark:bg-white/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-100 dark:border-white/20 shadow-sm">
              {ORGANIZERS.map(o => (
                <div key={o.alt} className={`relative flex-shrink-0 ${o.cls}`}>
                  <Image
                    src={o.src}
                    alt={o.alt}
                    fill
                    className="object-contain opacity-85 dark:brightness-110 dark:contrast-125"
                  />
                </div>
              ))}
            </div>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/60 hidden sm:block" />
            {/* Theme + Lang controls */}
            <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-100 dark:border-slate-800/50 rounded-full p-1 h-12 shadow-sm shadow-slate-100/50 dark:shadow-none">
              <ThemeToggle size={15} className="!rounded-full !p-2.5 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200" />
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/60" />
              <button
                onClick={() => setLang(l => l === "en" ? "vi" : "en")}
                className="relative overflow-hidden flex items-center justify-center w-14 h-8 rounded-full text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 active:scale-95"
                title={t.langToggle}
              >
                <span key={lang} className="flex items-center justify-center gap-1 animate-lang-slide">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                  </svg>
                  {lang === "en" ? "VI" : "EN"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 sm:py-3.5">

        {/* ── Progress tracker (Integrated Overlay Stepper) ── */}
        {!submitted && !alreadySubmitted && !IS_CLOSED && (
          <div className="relative mb-11 mt-4 w-full px-8 sm:px-16">
            {/* Background Track Line - Anchored at the centers of first and last circles */}
            <div className="absolute top-[18px] left-[50px] right-[50px] sm:left-[82px] sm:right-[82px] h-1 bg-slate-200 dark:bg-slate-800/80 -translate-y-1/2 rounded-full" />
            
            {/* Active Progress Line - Flowing exactly to the center of active step */}
            <div className="absolute top-[18px] left-[50px] right-[50px] sm:left-[82px] sm:right-[82px] h-1 -translate-y-1/2 pointer-events-none">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            
            {/* Steps Container */}
            <div className="relative flex justify-between w-full">
              {t.steps.map((label, i) => {
                const s = i + 1;
                const isActive = step === s;
                const isCompleted = step > s;
                const isClickable = true;

                const handleStepClick = () => {
                  if (s === step) return;
                  if (s < step) {
                    setDirection("prev");
                    setStep(s);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    // Validate sequentially from 'step' up to 's - 1'
                    for (let temp = step; temp < s; temp++) {
                      if (!validate(temp)) {
                        // If validation fails, navigate to the first invalid step to correct it
                        if (temp !== step) {
                          setDirection("next");
                          setStep(temp);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                        return; // Stop navigation
                      }
                    }
                    // All intermediate steps are valid, navigate to target step!
                    setDirection("next");
                    setStep(s);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                };

                return (
                  <div key={s} className="flex flex-col items-center relative w-9">
                    {/* Circle Node */}
                    <button
                      onClick={handleStepClick}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 relative z-10 hover:scale-105 active:scale-95 cursor-pointer
                        ${isActive ? "border-cyan-500 bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-110"
                          : isCompleted  ? "border-cyan-500 bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                          : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 hover:border-cyan-400 hover:text-cyan-500"}`}
                    >
                      {isCompleted
                        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        : String(s).padStart(2, "0")}
                    </button>
                    {/* Text Label - Absolute positioned to completely isolate layout widths */}
                    <span
                      onClick={handleStepClick}
                      className={`absolute top-11 left-1/2 -translate-x-1/2 text-[11px] font-bold text-center w-[120px] sm:w-[150px] leading-tight transition-colors duration-300 cursor-pointer hover:text-cyan-650 dark:hover:text-cyan-400
                        ${isActive ? "text-cyan-600 dark:text-cyan-400" : isCompleted ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"}`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Toast for Draft Restoration Notification */}
        <Toast
          message={lang === "en" ? "Your previous progress has been restored." : "Tiến độ điền form trước đó đã được khôi phục."}
          isVisible={draftRestored && !submitted && !alreadySubmitted && !IS_CLOSED}
          onClose={() => setDraftRestored(false)}
        />

        <div className="relative z-20 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/50 rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-100/80 dark:shadow-none transition-all duration-300">
          {submitted ? (
            <Success t={t} name={form.fullName} />
          ) : alreadySubmitted ? (
            <AlreadySubmitted lang={lang} name={savedName} onClear={handleClear} />
          ) : IS_CLOSED ? (
            <ClosedForm lang={lang} />
          ) : (
            <>
              <div key={step} className={`relative z-10 ${direction === "next" ? "animate-slide-next" : "animate-slide-prev"}`}>
                {step === 1 && (
                  <Step1
                    t={t}
                    agreed={form.agreePrivacy}
                    onToggle={() => {
                      setForm(p => ({ ...p, agreePrivacy: !p.agreePrivacy }));
                      setErrors(p => { const e = { ...p }; delete e.agreePrivacy; return e; });
                    }}
                    error={errors.agreePrivacy}
                  />
                )}
                {step === 2 && <Step2 t={t} data={form} errors={errors} onChange={set} />}
                {step === 3 && (
                  <Step3
                    t={t}
                    data={form}
                    errors={errors}
                    onChange={set}
                    onFileChange={handleFile}
                    uploadingCv={uploadingCv}
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100 dark:border-slate-850/30">
                <button
                  onClick={prev} disabled={step === 1}
                  className={`group relative flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95
                    ${step === 1 ? "opacity-0 pointer-events-none"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"}`}
                >
                  <svg className="absolute left-4 w-4 h-4 opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  <span className="transition-transform duration-300 ease-out group-hover:translate-x-2.5">{t.back}</span>
                </button>

                {step < t.steps.length ? (
                  <button onClick={next} className="group relative flex items-center justify-center px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl shadow-sm shadow-cyan-900/10 dark:shadow-cyan-950/20 transition-all duration-200 active:scale-95">
                    <span className="transition-transform duration-300 ease-out group-hover:-translate-x-2.5">{t.next}</span>
                    <svg className="absolute right-5 w-4 h-4 opacity-0 translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                ) : (
                  <button onClick={submit} disabled={submitting || uploadingCv}
                    className={`group relative flex items-center justify-center px-9 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold rounded-xl shadow-sm shadow-cyan-900/10 dark:shadow-cyan-950/20 transition-all duration-200 active:scale-95 ${(submitting || uploadingCv) ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t.submitting}
                      </div>
                    ) : (
                      <>
                        <svg className="absolute left-6 w-4 h-4 opacity-0 -translate-x-2.5 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                        <span className="transition-transform duration-300 ease-out group-hover:translate-x-2.5">{t.submit}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Contact info / inquiries */}
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/30 rounded-2xl py-3 px-4 max-w-md mx-auto shadow-sm">
          {lang === "vi" ? (
            <span>
              Mọi thắc mắc vui lòng liên hệ{" "}
              <a href="mailto:bdc@hcmut.edu.vn" className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold">bdc@hcmut.edu.vn</a>
              {" "}hoặc qua Fanpage{" "}
              <a href="https://www.facebook.com/BDCofHCMUT" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold">Big Data Club</a>.
            </span>
          ) : (
            <span>
              For any inquiries, please contact{" "}
              <a href="mailto:bdc@hcmut.edu.vn" className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold">bdc@hcmut.edu.vn</a>
              {" "}or via{" "}
              <a href="https://www.facebook.com/BDCofHCMUT" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold">Big Data Club Fanpage</a>.
            </span>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400/80 dark:text-slate-500/80">
          <div className="flex items-center gap-3.5">
            {ORGANIZERS.map(o => (
              <div key={o.alt} className={`relative flex-shrink-0 ${o.cls} transform hover:scale-110 transition-transform`}>
                <Image src={o.src} alt={o.alt} fill className="object-contain opacity-40 hover:opacity-75 transition-opacity" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a href="https://hpcc.hcmut.edu.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">hpcc.hcmut.edu.vn</a>
            <span>·</span>
            <a href="https://bdc.hpcc.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">bdc.hpcc.vn</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
