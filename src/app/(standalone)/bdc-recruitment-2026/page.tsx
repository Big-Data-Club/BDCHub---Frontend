"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

import bdcLogo from "@/assets/bdclogo.png";
import hcmutLogo from "@/assets/hcmut.png";
import hpccLogo from "@/assets/hpcc-logo.png";
import cseLogo from "@/assets/CSE_logo.png";

import { FormData, Errors, Lang, T, ACADEMIC_STATUS_OPTIONS, DEPARTMENT_OPTIONS, ENTRANCE_METHOD_OPTIONS, TIME_COMMITMENT_OPTIONS } from "./types";
import { Step1Personal } from "./components/Step1Personal";
import { Step2Academic } from "./components/Step2Academic";
import { Step3Department } from "./components/Step3Department";
import { Step4Review } from "./components/Step4Review";
import { SuccessScreen } from "./components/SuccessScreen";
import { AlreadySubmittedScreen } from "./components/AlreadySubmittedScreen";
import { Toast } from "../hpc-summer-school/components/Toast";

const LS_DRAFT = "bdc_recruitment_2026_draft";
const LS_DONE = "bdc_recruitment_2026_submitted";

const INITIAL_FORM: FormData = {
  emailConfirmation: "",
  fullName: "",
  phone: "",
  emailPersonal: "",
  emailSchool: "",
  facebookLink: "",
  university: "",
  faculty: "",
  studentId: "",
  academicStatus: "freshman",
  academicStatusOther: "",
  entranceMethod: "thpt",
  thptBlock: "A00",
  thptBlockOther: "",
  entranceScoreDetail: "",
  gpaCumulative: "",
  gpaLatest: "",
  gpaScale: "4.0",
  thptDgnlScores: "",
  thptScore: "",
  hasDgnl: "yes",
  dgnlScore: "",
  achievementsExtracurricular: "",
  englishCert: "",
  englishCertType: "none",
  englishCertScore: "",
  cvFile: null,
  cvBioText: "",
  evidenceFiles: [],
  department: "",
  allowDepartmentAdjustment: true,
  weeklyTimeCommitment: "5_to_10h",
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
  const [confirmationEmailQueued, setConfirmationEmailQueued] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

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
        setDraftRestored(true);
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
      if (form.emailPersonal?.trim() && !emailRegex.test(form.emailPersonal.trim())) errs.emailPersonal = t.errEmail;
      if (!form.emailSchool?.trim() || !emailRegex.test(form.emailSchool.trim())) errs.emailSchool = t.errEmail;
      if (!form.facebookLink.trim()) errs.facebookLink = t.errFacebook;
      if (!form.university.trim()) errs.university = t.errRequired;
      if (!form.faculty.trim()) errs.faculty = t.errRequired;
      if (!form.academicStatus) errs.academicStatus = t.errRequired;
    }
    if (stepToValidate === 2) {
      if (form.englishCertType !== "none" && !form.englishCertScore?.trim()) {
        errs.englishCertScore = t.errRequired;
      }
      if (form.academicStatus === "freshman") {
        if (!form.thptScore?.trim() && !form.entranceScoreDetail?.trim()) {
          errs.thptScore = t.errRequired;
          errs.entranceScoreDetail = t.errRequired;
        }
        if (form.hasDgnl !== "no" && !form.dgnlScore?.trim()) {
          errs.dgnlScore = lang === "vi" ? "Vui lòng nhập điểm thi ĐGNL hoặc chọn 'Không thi ĐGNL'." : "Please enter your score or select 'Didn't take test'.";
        }
        // CV is optional for freshers if cvBioText is filled out
        if (!form.cvFile && !form.cvBioText?.trim()) {
          errs.cvFile = t.errCvRequired;
          errs.cvBioText = t.errRequired;
        }
      } else {
        if (!form.gpaCumulative.trim()) errs.gpaCumulative = t.errRequired;
        if (!form.gpaLatest.trim()) errs.gpaLatest = t.errRequired;
        if (!form.cvFile) errs.cvFile = t.errCvRequired;
      }
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
      const entranceLabel = ENTRANCE_METHOD_OPTIONS.find((e) => e.id === form.entranceMethod)?.labelVi || "THPT";
      const timeCommitmentLabel = TIME_COMMITMENT_OPTIONS.find((tc) => tc.id === form.weeklyTimeCommitment)?.labelVi || "5 - 10h/tuần";

      // answers: snake_case id → value (used for mapping)
      const answersRecord: Record<string, string> = {
        full_name:                    form.fullName,
        email_confirmation:           form.emailConfirmation,
        phone:                        form.phone,
        email_personal:               form.emailPersonal || "Bỏ qua",
        email_school:                 form.emailSchool || "",
        facebook_link:                form.facebookLink,
        university:                   form.university,
        faculty:                      form.faculty,
        student_id:                   form.studentId || "N/A",
        academic_status:              form.academicStatus === "other"
                                        ? (form.academicStatusOther || "Khác")
                                        : (ACADEMIC_STATUS_OPTIONS.find((s) => s.id === form.academicStatus)?.labelVi || form.academicStatus),
        thpt_dgnl_scores:             form.academicStatus === "freshman"
                                      ? `[${entranceLabel}]: ${form.entranceScoreDetail || form.thptDgnlScores || "N/A"}`
                                      : (form.thptDgnlScores || "N/A"),
        gpa_cumulative:               form.gpaCumulative   || "N/A",
        gpa_latest:                   form.gpaLatest       || "N/A",
        achievements_extracurricular: form.achievementsExtracurricular || "Chưa có",
        english_cert:                 form.englishCertType === "none" || !form.englishCertType
                                      ? "Chưa có"
                                      : `${form.englishCertType.toUpperCase()}: ${form.englishCertScore || ""}`,
        cv_url:                       form.cvFile?.url
                                        ? form.cvFile.url
                                        : (form.cvBioText ? `[Tóm tắt bản thân]: ${form.cvBioText}` : "Chưa nộp"),
        cv_filename:                  form.cvFile?.filename || (form.cvBioText ? "Tóm tắt chữ (Chưa có PDF)" : "Không có"),
        evidence_files:               form.evidenceFiles.length > 0
                                        ? form.evidenceFiles.map((f, i) => `${i + 1}. ${f.filename}: ${f.url}`).join("\n")
                                        : "Không có",
        department:                   DEPARTMENT_OPTIONS.find((d) => d.id === form.department)?.nameVi ?? form.department,
        allow_adjustment:             form.allowDepartmentAdjustment ? "Có" : "Không",
        weekly_time_commitment:       timeCommitmentLabel,
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
        { id: "facebook_link",                question: "Link Facebook cá nhân" },
        { id: "university",                   question: "Trường đại học" },
        { id: "faculty",                      question: "Khoa / Ngành" },
        { id: "student_id",                   question: "Mã số sinh viên" },
        { id: "academic_status",              question: "Tình trạng học tập" },
        { id: "thpt_dgnl_scores",             question: "Phương thức & Điểm tuyển sinh" },
        { id: "gpa_cumulative",               question: "GPA tích lũy" },
        { id: "gpa_latest",                   question: "GPA học kỳ gần nhất" },
        { id: "achievements_extracurricular", question: "Thành tích & Hoạt động ngoại khóa" },
        { id: "english_cert",                 question: "Chứng chỉ tiếng Anh" },
        { id: "cv_url",                       question: "Link CV / Tóm tắt bản thân" },
        { id: "cv_filename",                  question: "Tên file CV" },
        { id: "evidence_files",               question: "File minh chứng" },
        { id: "department",                   question: "Ban đăng ký" },
        { id: "allow_adjustment",             question: "Đồng ý điều phối" },
        { id: "weekly_time_commitment",       question: "Thời gian cống hiến/tuần" },
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
      setConfirmationEmailQueued(data.confirmationEmailQueued === true);
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
    setConfirmationEmailQueued(false);
    setStep(1);
  };

  if (alreadySubmitted) return <AlreadySubmittedScreen savedName={savedName} lang={lang} onReset={handleResetForm} />;
  if (submitted) return <SuccessScreen fullName={form.fullName} email={form.emailConfirmation} lang={lang} confirmationEmailQueued={confirmationEmailQueued} onReset={handleResetForm} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white font-sans pb-16 pt-16 sm:pt-20 transition-colors duration-300">
      {/* Toast */}
      {toastMsg && (
        <div role="alert" aria-live="assertive" className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom-4 duration-300">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Toast for Draft Restoration Notification */}
      <Toast
        message={lang === "en" ? "Your previous progress has been restored." : "Tiến độ điền form trước đó đã được khôi phục."}
        isVisible={draftRestored && !submitted && !alreadySubmitted}
        onClose={() => setDraftRestored(false)}
      />

      {/* ── Fixed Glass Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-[#050B18]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-blue-500/10 shadow-sm py-3"
            : "bg-white/60 dark:bg-transparent backdrop-blur-md py-3.5"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-white dark:bg-[#0D192E] p-1.5 rounded-xl border border-slate-200 dark:border-blue-500/20 shadow-sm">
              <Image src={bdcLogo} alt="BDC" fill className="object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                BIG DATA CLUB <span className="text-blue-600 dark:text-cyan-400 text-xs font-bold ml-1">2026</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate">HCMUT · Empowering Tomorrow&apos;s Tech Leaders</p>
            </div>
          </div>

          {/* Right: partner logos + lang + theme */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2.5 mr-2 pr-2.5 border-r border-slate-200 dark:border-blue-500/15">
              {[
                { src: hcmutLogo, alt: "HCMUT", cls: "w-5 h-5" },
                { src: hpccLogo, alt: "HPCC", cls: "w-10 h-5" },
                { src: cseLogo, alt: "CSE", cls: "w-5 h-5" },
              ].map((logo) => (
                <div key={logo.alt} className={`relative flex-shrink-0 ${logo.cls}`}>
                  <Image src={logo.src} alt={logo.alt} fill className="object-contain opacity-75 dark:opacity-90 dark:brightness-125" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setLang((l) => (l === "vi" ? "en" : "vi"))}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-blue-500/20 bg-white dark:bg-[#0D192E] hover:bg-slate-100 dark:hover:bg-[#0F1E35] text-slate-700 dark:text-cyan-400 font-bold transition-all shadow-sm active:scale-95"
            >
              {t.langToggle}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Wizard ── */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {/* Compact Hero Info Header */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
            {t.heroTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{t.heroSubtitle}</span> · {t.heroDesc}
          </p>
        </div>

        {/* Step Progress Bar (Integrated Overlay Stepper) */}
        <div className="relative mb-10 sm:mb-14 mt-4 sm:mt-6 w-full px-4 sm:px-16 z-10">
          {/* Mobile Current Step Indicator Badge */}
          <div className="sm:hidden text-center mb-4">
            <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/20 px-3.5 py-1.5 rounded-full shadow-xs">
              Bước {step}/4: {t.steps[step - 1]?.title}
            </span>
          </div>

          {/* Background Track Line */}
          <div className="absolute top-[18px] sm:top-[18px] left-[36px] right-[36px] sm:left-[82px] sm:right-[82px] h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full" />

          {/* Active Progress Line */}
          <div className="absolute top-[18px] sm:top-[18px] left-[36px] right-[36px] sm:left-[82px] sm:right-[82px] h-1 -translate-y-1/2 pointer-events-none">
            <div
              className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full transition-all duration-300 shadow-xs"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>

          {/* Steps Container */}
          <div className="relative flex justify-between w-full">
            {t.steps.map((st) => {
              const isCompleted = step > st.step;
              const isCurrent = step === st.step;

              const handleStepClick = () => {
                if (st.step === step) return;
                if (st.step < step) {
                  setStep(st.step);
                } else {
                  for (let temp = step; temp < st.step; temp++) {
                    if (!validateStep(temp)) {
                      if (temp !== step) setStep(temp);
                      return;
                    }
                  }
                  setStep(st.step);
                }
              };

              return (
                <div key={st.step} className="flex flex-col items-center relative w-9">
                  {/* Circle Node */}
                  <button
                    type="button"
                    onClick={handleStepClick}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 relative z-10 hover:scale-105 active:scale-95 cursor-pointer touch-manipulation min-h-[36px] min-w-[36px]
                      ${
                        isCurrent
                          ? "border-blue-600 dark:border-cyan-400 bg-blue-600 dark:bg-cyan-400 text-white dark:text-slate-950 shadow-md scale-105"
                          : isCompleted
                          ? "border-blue-600 dark:border-cyan-400 bg-blue-600 dark:bg-cyan-400 text-white dark:text-slate-950"
                          : "border-slate-300 dark:border-blue-500/20 bg-white dark:bg-[#0D192E] text-slate-400 dark:text-slate-500 hover:border-slate-400 dark:hover:border-blue-500/40"
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    ) : (
                      String(st.step).padStart(2, "0")
                    )}
                  </button>
                  {/* Text Label */}
                  <span
                    onClick={handleStepClick}
                    className={`hidden sm:block absolute top-11 left-1/2 -translate-x-1/2 text-xs font-semibold text-center w-[120px] sm:w-[150px] leading-tight transition-colors duration-300 cursor-pointer hover:text-blue-600 dark:hover:text-cyan-400
                      ${
                        isCurrent
                          ? "text-blue-600 dark:text-cyan-400 font-bold"
                          : isCompleted
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-600"
                      }`}
                  >
                    {st.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content Card */}
        <div className="relative z-10 p-6 sm:p-10 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl shadow-xs">
          {step === 1 && <Step1Personal form={form} onChange={updateForm} errors={errors} lang={lang} />}
          {step === 2 && <Step2Academic form={form} onChange={updateForm} errors={errors} lang={lang} />}
          {step === 3 && <Step3Department form={form} onChange={updateForm} errors={errors} lang={lang} />}
          {step === 4 && <Step4Review form={form} onChange={updateForm} errors={errors} lang={lang} onEditStep={(st) => setStep(st)} />}

          {/* Navigation Controls */}
          <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200 dark:border-blue-500/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0D192E] dark:hover:bg-[#162644] text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all active:scale-95 border border-slate-200 dark:border-blue-500/20 min-h-[44px] cursor-pointer touch-manipulation"
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
                className="inline-flex items-center justify-center space-x-2 px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all active:scale-95 shadow-sm hover:shadow-blue-500/20 sm:ml-auto min-h-[44px] cursor-pointer touch-manipulation"
              >
                <span>{t.btnNext}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="inline-flex items-center justify-center space-x-2 px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-extrabold transition-all active:scale-95 shadow-sm hover:shadow-emerald-500/30 sm:ml-auto min-h-[44px] cursor-pointer touch-manipulation"
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
