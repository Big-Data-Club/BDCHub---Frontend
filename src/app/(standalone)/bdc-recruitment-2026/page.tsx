"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, ArrowRight, ArrowLeft, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

import bdcLogo from "@/assets/bdclogo.png";
import hcmutLogo from "@/assets/hcmut.png";
import hpccLogo from "@/assets/hpcc-logo.png";
import cseLogo from "@/assets/CSE_logo.png";

import { FormData, Errors, Lang, T, ACADEMIC_STATUS_OPTIONS, DEPARTMENT_OPTIONS } from "./types";
import { Step1Personal } from "./components/Step1Personal";
import { Step2Academic } from "./components/Step2Academic";
import { Step3Department } from "./components/Step3Department";
import { Step4Review } from "./components/Step4Review";
import { SuccessScreen } from "./components/SuccessScreen";
import { AlreadySubmittedScreen } from "./components/AlreadySubmittedScreen";

const LS_DRAFT = "bdc_recruitment_2026_draft";
const LS_DONE = "bdc_recruitment_2026_submitted";

const INITIAL_FORM: FormData = {
  emailConfirmation: "",
  fullName: "",
  phone: "",
  emailPersonal: "",
  emailSchool: "",
  facebookLink: "",
  university: "Trường Đại học Bách Khoa - ĐHQG TP.HCM (HCMUT)",
  faculty: "",
  studentId: "",
  academicStatus: "freshman",
  academicStatusOther: "",
  gpaCumulative: "",
  gpaLatest: "",
  thptDgnlScores: "",
  achievementsExtracurricular: "",
  englishCert: "",
  cvFile: null,
  evidenceFiles: [],
  department: "",
  motivation: "",
  sendCopy: true,
  agreePrivacy: false,
};

export default function BDCRecruitment2026Page() {
  const [lang, setLang] = useState<Lang>("vi");
  const t = T[lang];

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        setForm((prev) => ({ ...prev, ...draft }));
        if (draft._step && draft._step > 0 && draft._step <= 4) setStep(draft._step);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (submitted || alreadySubmitted) return;
    const timer = setTimeout(() => {
      try { localStorage.setItem(LS_DRAFT, JSON.stringify({ ...form, _step: step })); } catch { /* ignore */ }
    }, 600);
    return () => clearTimeout(timer);
  }, [form, step, submitted, alreadySubmitted]);

  const updateForm = (fields: Partial<FormData>) => {
    setForm((prev) => ({ ...prev, ...fields }));
    const updatedKeys = Object.keys(fields);
    if (updatedKeys.some((k) => errors[k])) {
      setErrors((prev) => {
        const next = { ...prev };
        updatedKeys.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const validateStep = (stepToValidate: number): boolean => {
    const errs: Errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+()\s-]{8,15}$/;

    if (stepToValidate === 1) {
      if (!form.emailConfirmation.trim() || !emailRegex.test(form.emailConfirmation)) errs.emailConfirmation = t.errEmail;
      if (!form.fullName.trim()) errs.fullName = t.errRequired;
      if (!form.phone.trim() || !phoneRegex.test(form.phone)) errs.phone = t.errPhone;
      if (!form.emailPersonal.trim() || !emailRegex.test(form.emailPersonal)) errs.emailPersonal = t.errEmail;
      if (!form.emailSchool.trim() || !emailRegex.test(form.emailSchool)) errs.emailSchool = t.errEmail;
      if (!form.facebookLink.trim() || !form.facebookLink.includes("facebook.com")) errs.facebookLink = t.errFacebook;
      if (!form.university.trim()) errs.university = t.errRequired;
      if (!form.faculty.trim()) errs.faculty = t.errRequired;
      if (!form.academicStatus) errs.academicStatus = t.errRequired;
    }
    if (stepToValidate === 2) {
      if (form.academicStatus === "freshman") {
        if (!form.thptDgnlScores.trim()) errs.thptDgnlScores = t.errRequired;
        if (!form.englishCert.trim()) errs.englishCert = t.errRequired;
      } else {
        if (!form.gpaCumulative.trim()) errs.gpaCumulative = t.errRequired;
        if (!form.gpaLatest.trim()) errs.gpaLatest = t.errRequired;
      }
      if (!form.cvFile) errs.cvFile = t.errCvRequired;
    }
    if (stepToValidate === 3) {
      if (!form.department) errs.department = t.errDeptRequired;
      if (!form.motivation.trim()) errs.motivation = t.errRequired;
    }
    if (stepToValidate === 4) {
      if (!form.agreePrivacy) errs.agreePrivacy = t.agreePrivacyErr;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showToast("Vui lòng hoàn thành các trường thông tin bắt buộc.");
    }
  };

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) { showToast(t.agreePrivacyErr); return; }
    setSubmitting(true);
    try {
      // answers: snake_case id → value (used for mapping)
      const answersRecord: Record<string, string> = {
        full_name:                    form.fullName,
        email_confirmation:           form.emailConfirmation,
        phone:                        form.phone,
        email_personal:               form.emailPersonal,
        email_school:                 form.emailSchool,
        facebook_link:                form.facebookLink,
        university:                   form.university,
        faculty:                      form.faculty,
        student_id:                   form.studentId || "N/A",
        academic_status:              ACADEMIC_STATUS_OPTIONS.find((s) => s.id === form.academicStatus)?.labelVi
                                    ?? (form.academicStatusOther || form.academicStatus),
        thpt_dgnl_scores:             form.thptDgnlScores  || "N/A",
        gpa_cumulative:               form.gpaCumulative   || "N/A",
        gpa_latest:                   form.gpaLatest       || "N/A",
        achievements_extracurricular: form.achievementsExtracurricular || "Chưa có",
        english_cert:                 form.englishCert     || "Chưa có",
        cv_url:                       form.cvFile?.url     || "",
        cv_filename:                  form.cvFile?.filename || "",
        evidence_files:               form.evidenceFiles.map((f) => `${f.filename}: ${f.url}`).join(" | "),
        department:                   DEPARTMENT_OPTIONS.find((d) => d.id === form.department)?.nameVi ?? form.department,
        motivation:                   form.motivation,
        send_copy:                    form.sendCopy ? "Có" : "Không",
        form_language:                lang === "vi" ? "Tiếng Việt" : "English",
      };

      // questions: id maps to answers key, question = Vietnamese column header in Sheet
      const QUESTIONS: { id: string; question: string }[] = [
        { id: "full_name",                    question: "Họ và tên" },
        { id: "email_confirmation",           question: "Email (Google Account)" },
        { id: "phone",                        question: "Số điện thoại" },
        { id: "email_personal",               question: "Email cá nhân" },
        { id: "email_school",                 question: "Email trường" },
        { id: "facebook_link",                question: "Facebook" },
        { id: "university",                   question: "Trường đại học" },
        { id: "faculty",                      question: "Khoa / Ngành" },
        { id: "student_id",                   question: "Mã số sinh viên" },
        { id: "academic_status",              question: "Tình trạng học tập" },
        { id: "thpt_dgnl_scores",             question: "Điểm THPT / ĐGNL" },
        { id: "gpa_cumulative",               question: "GPA tích lũy" },
        { id: "gpa_latest",                   question: "GPA học kỳ gần nhất" },
        { id: "achievements_extracurricular", question: "Thành tích & Hoạt động ngoại khóa" },
        { id: "english_cert",                 question: "Chứng chỉ tiếng Anh" },
        { id: "cv_url",                       question: "Link CV (Cloudinary)" },
        { id: "cv_filename",                  question: "Tên file CV" },
        { id: "evidence_files",               question: "File minh chứng" },
        { id: "department",                   question: "Ban đăng ký" },
        { id: "motivation",                   question: "Lý do & Động lực" },
        { id: "send_copy",                    question: "Gửi bản sao qua email" },
        { id: "form_language",                question: "Ngôn ngữ form" },
      ];

      const payload = {
        formId:    "bdc-recruitment-2026-participant",
        formTitle: "Application Form - BIG DATA CLUB RECRUITMENT 2026",
        sheetName: "BDC_Recruitment_2026",
        formType:  "registration",
        questions: QUESTIONS,
        answers:   answersRecord,
        submittedAt: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      };
      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Gửi đơn không thành công.");
      localStorage.setItem(LS_DONE, JSON.stringify({ name: form.fullName, submittedAt: new Date().toISOString() }));
      localStorage.removeItem(LS_DRAFT);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      showToast(err instanceof Error ? err.message : "Đã xảy ra lỗi khi gửi đơn.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    localStorage.removeItem(LS_DONE);
    localStorage.removeItem(LS_DRAFT);
    setForm(INITIAL_FORM);
    setAlreadySubmitted(false);
    setSubmitted(false);
    setStep(1);
  };

  if (alreadySubmitted) return <AlreadySubmittedScreen savedName={savedName} lang={lang} onReset={handleResetForm} />;
  if (submitted) return <SuccessScreen fullName={form.fullName} email={form.emailConfirmation} lang={lang} />;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white font-sans pb-20 transition-colors duration-300">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom-4 duration-300">
          <ShieldAlert className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Sticky Header ── */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/50 shadow-sm py-3"
          : "bg-white/60 dark:bg-transparent backdrop-blur-sm py-3.5"
      }`}>
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-4">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-9 h-9 flex-shrink-0 bg-white/60 dark:bg-white/10 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
              <Image src={bdcLogo} alt="BDC" fill className="object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                BIG DATA CLUB <span className="text-blue-500 dark:text-blue-400 text-xs font-normal">2026</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Chào Đón Thế Hệ Mới</p>
            </div>
          </div>

          {/* Right: org logos + lang + theme */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 mr-2 pr-2 border-r border-slate-200 dark:border-slate-800">
              {[
                { src: hcmutLogo, alt: "HCMUT", cls: "w-5 h-5" },
                { src: hpccLogo, alt: "HPCC", cls: "w-10 h-5" },
                { src: cseLogo, alt: "CSE", cls: "w-5 h-5" },
              ].map((logo) => (
                <div key={logo.alt} className={`relative flex-shrink-0 ${logo.cls}`}>
                  <Image src={logo.src} alt={logo.alt} fill className="object-contain opacity-70 dark:opacity-80 dark:brightness-125" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setLang((l) => (l === "vi" ? "en" : "vi"))}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors font-medium shadow-sm"
            >
              {t.langToggle}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden pt-20 pb-10 px-4 bg-gradient-to-b from-blue-50 via-white to-white dark:from-blue-950/40 dark:via-slate-950 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/40 via-transparent to-transparent dark:from-blue-600/10 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.heroBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-700 to-blue-500 dark:from-white dark:via-slate-100 dark:to-blue-200">
            {t.heroTitle}
          </h1>

          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t.heroSubtitle}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">{t.heroDesc}</p>
        </div>
      </div>

      {/* ── Main Wizard ── */}
      <main className="max-w-3xl mx-auto px-4 mt-8">
        {/* Step Progress Bar */}
        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-4 gap-2">
            {t.steps.map((st) => {
              const isCompleted = step > st.step;
              const isCurrent = step === st.step;
              return (
                <button
                  key={st.step}
                  onClick={() => {
                    if (st.step < step || validateStep(step)) setStep(st.step);
                  }}
                  className={`text-left transition-all p-2 rounded-xl border ${
                    isCurrent
                      ? "bg-blue-50 dark:bg-blue-500/15 border-blue-300 dark:border-blue-500/60 text-blue-700 dark:text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)] dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      : isCompleted
                      ? "bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                      : "bg-transparent border-transparent text-slate-400 dark:text-slate-500"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white border-emerald-400"
                        : isCurrent
                        ? "bg-blue-500 text-white border-blue-400"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-700"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : st.step}
                    </div>
                    <span className="text-xs font-bold hidden sm:inline truncate">Bước {st.step}</span>
                  </div>
                  <p className="text-[11px] font-semibold truncate leading-tight hidden sm:block">{st.title}</p>
                </button>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="mt-3 w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-3xl shadow-xl dark:shadow-2xl dark:backdrop-blur-xl">
          {step === 1 && <Step1Personal form={form} onChange={updateForm} errors={errors} lang={lang} />}
          {step === 2 && <Step2Academic form={form} onChange={updateForm} errors={errors} lang={lang} />}
          {step === 3 && <Step3Department form={form} onChange={updateForm} errors={errors} lang={lang} />}
          {step === 4 && <Step4Review form={form} onChange={updateForm} errors={errors} lang={lang} onEditStep={(st) => setStep(st)} />}

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all border border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.btnPrev}</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg hover:shadow-blue-500/25 ml-auto"
              >
                <span>{t.btnNext}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-xl hover:shadow-emerald-500/30 ml-auto cursor-pointer"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t.btnSubmitting}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.btnSubmit}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
