"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// Import logos from assets
import hcmutLogo from "@/assets/hcmut.png";
import bdcLogo from "@/assets/bdclogo.png";

// Types & Helpers
import { FormData, Errors, MAX_SCORES, THRESHOLDS } from "./types";
import { Step1 } from "./components/Step1";
import { Step2 } from "./components/Step2";
import { Step3 } from "./components/Step3";
import { Step4 } from "./components/Step4";
import { Success } from "./components/Success";
import { AlreadySubmitted } from "./components/AlreadySubmitted";

const LS_DRAFT = "mt23khm3_hk252_draft";
const LS_SUBMITTED = "mt23khm3_hk252_submitted";
const LS_SUBMITTED_DATA = "mt23khm3_hk252_submitted_data";

const EMPTY_FORM: FormData = {
  fullName: "",
  lastName: "",
  firstName: "",
  studentId: "",
  email: "",
  score1: "",
  score2: "",
  score3: "",
  score4: "",
  score5: "",
  score6: "0",
  evidenceUrl1: "",
  evidenceUrl2: "",
  evidenceUrl3: "",
  evidenceUrl4: "",
  evidenceUrl5: "",
  evidenceUrl6: "",
  evidenceName1: "",
  evidenceName2: "",
  evidenceName3: "",
  evidenceName4: "",
  evidenceName5: "",
  evidenceName6: "",
  inquiry: "",
  agreeTruth: false,
  password: "",
};

export default function TrainingPointFormPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  
  // App states
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ── Scroll Listener for Sticky Header ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Mount Check: Restore draft or load submitted screen ──
  useEffect(() => {
    try {
      const isDone = localStorage.getItem(LS_SUBMITTED);
      if (isDone === "true") {
        setAlreadySubmitted(true);
        return;
      }
      
      const rawDraft = localStorage.getItem(LS_DRAFT);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        // Clear any files that were in-progress, but restore text fields
        setForm({
          ...EMPTY_FORM,
          ...draft,
        });
        if (draft._step && draft._step > 1) {
          setStep(draft._step);
        }
        setDraftRestored(true);
        setTimeout(() => setDraftRestored(false), 4000);
      }
    } catch (err) {
      console.error("Lỗi khi khôi phục bản nháp:", err);
    }
  }, []);

  // ── Debounced Draft Auto-save ──
  useEffect(() => {
    if (isSubmitted || alreadySubmitted) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(LS_DRAFT, JSON.stringify({ ...form, _step: step }));
      } catch (err) {
        console.error("Lỗi khi tự động lưu bản nháp:", err);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form, step, isSubmitted, alreadySubmitted]);

  // ── Field Completion Progress Calculator ──
  const getProgressDetails = () => {
    // 13 base fields
    const baseFields = [
      { key: "lastName", val: form.lastName },
      { key: "firstName", val: form.firstName },
      { key: "studentId", val: form.studentId },
      { key: "email", val: form.email },
      { key: "score1", val: form.score1 },
      { key: "score2", val: form.score2 },
      { key: "score3", val: form.score3 },
      { key: "score4", val: form.score4 },
      { key: "score5", val: form.score5 },
      { key: "score6", val: form.score6 },
      { key: "inquiry", val: form.inquiry },
      { key: "agreeTruth", val: form.agreeTruth ? "true" : "" },
      { key: "password", val: form.password },
    ];

    let total = baseFields.length;
    let completed = baseFields.filter((f) => f.val.toString().trim().length > 0).length;

    // Check dynamic evidence uploads
    const s1 = parseFloat(form.score1) || 0;
    if (s1 > THRESHOLDS.score1) {
      total += 1;
      if (form.evidenceUrl1) completed += 1;
    }

    const s2 = parseFloat(form.score2) || 0;
    if (s2 > THRESHOLDS.score2) {
      total += 1;
      if (form.evidenceUrl2) completed += 1;
    }

    const s3 = parseFloat(form.score3) || 0;
    if (s3 > THRESHOLDS.score3) {
      total += 1;
      if (form.evidenceUrl3) completed += 1;
    }

    const s4 = parseFloat(form.score4) || 0;
    if (s4 > THRESHOLDS.score4) {
      total += 1;
      if (form.evidenceUrl4) completed += 1;
    }

    const s5 = parseFloat(form.score5) || 0;
    if (s5 >= THRESHOLDS.score5) {
      total += 1;
      if (form.evidenceUrl5) completed += 1;
    }

    const s6 = parseFloat(form.score6) || 0;
    if (s6 > 0) {
      total += 1;
      if (form.evidenceUrl6) completed += 1;
    }

    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const { completed, total, percentage } = getProgressDetails();

  const handleClearSubmitted = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch sử nộp biểu mẫu trên trình duyệt này? Hành động này không thể hoàn tác.")) return;
    try {
      localStorage.removeItem(LS_SUBMITTED);
      localStorage.removeItem(LS_SUBMITTED_DATA);
      localStorage.removeItem(LS_DRAFT);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const setField = (field: keyof FormData, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) {
      setErrors((p) => {
        const e = { ...p };
        delete e[field];
        return e;
      });
    }
  };

  const handleEvidenceUploaded = (field: keyof FormData, url: string, filename: string) => {
    const urlField = field;
    const nameField = field === "evidenceUrl1" ? "evidenceName1" :
                      field === "evidenceUrl2" ? "evidenceName2" :
                      field === "evidenceUrl3" ? "evidenceName3" :
                      field === "evidenceUrl4" ? "evidenceName4" :
                      field === "evidenceUrl5" ? "evidenceName5" : "evidenceName6";
    setForm((p) => ({ ...p, [urlField]: url, [nameField]: filename }));
    if (errors[urlField]) {
      setErrors((p) => {
        const e = { ...p };
        delete e[urlField];
        return e;
      });
    }
  };

  // Validation Logic per step
  const validate = (stepNum = step) => {
    const e: Errors = {};

    if (stepNum === 1) {
      if (!form.lastName.trim()) e.lastName = "Họ và Tên lót không được để trống.";
      if (!form.firstName.trim()) e.firstName = "Tên không được để trống.";
      
      const studentIdPattern = /^\d{7}$/;
      if (!form.studentId.trim()) {
        e.studentId = "Mã số sinh viên không được để trống.";
      } else if (!studentIdPattern.test(form.studentId.trim())) {
        e.studentId = "Mã số sinh viên phải gồm đúng 7 chữ số (VD: 2319999).";
      }

      if (!form.email.trim()) {
        e.email = "Email sinh viên không được để trống.";
      } else if (!form.email.toLowerCase().endsWith("@hcmut.edu.vn")) {
        e.email = "Email phải có đuôi @hcmut.edu.vn.";
      }
    } else if (stepNum === 2) {
      // Score Range Validations
      const validateScore = (val: string, max: number, field: string, name: string) => {
        if (!val.trim()) {
          e[field] = `Điểm ${name} không được để trống.`;
          return;
        }
        const num = parseFloat(val);
        if (isNaN(num)) {
          e[field] = "Điểm phải là số.";
        } else if (num < 0 || num > max) {
          e[field] = `Điểm rèn luyện phải nằm trong khoảng từ 0 đến ${max}.`;
        }
      };

      validateScore(form.score1, MAX_SCORES.score1, "score1", "Mục 1");
      validateScore(form.score2, MAX_SCORES.score2, "score2", "Mục 2");
      validateScore(form.score3, MAX_SCORES.score3, "score3", "Mục 3");
      validateScore(form.score4, MAX_SCORES.score4, "score4", "Mục 4");
      validateScore(form.score5, MAX_SCORES.score5, "score5", "Mục 5");

      if (!form.score6.trim()) {
        e.score6 = "Điểm thưởng không được để trống (nhập 0 nếu không có).";
      } else if (isNaN(parseFloat(form.score6)) || parseFloat(form.score6) < 0) {
        e.score6 = "Điểm thưởng phải là số lớn hơn hoặc bằng 0.";
      }

      // Check conditional evidence uploads
      const s1 = parseFloat(form.score1) || 0;
      if (s1 > THRESHOLDS.score1 && !form.evidenceUrl1) {
        e.evidenceUrl1 = "Bạn tự đánh giá điểm mục 1 > 18 nên cần đính kèm file minh chứng.";
      }

      const s2 = parseFloat(form.score2) || 0;
      if (s2 > THRESHOLDS.score2 && !form.evidenceUrl2) {
        e.evidenceUrl2 = "Bạn tự đánh giá điểm mục 2 > 22.5 nên cần đính kèm file minh chứng.";
      }

      const s3 = parseFloat(form.score3) || 0;
      if (s3 > THRESHOLDS.score3 && !form.evidenceUrl3) {
        e.evidenceUrl3 = "Bạn tự đánh giá điểm mục 3 > 18 nên cần đính kèm file minh chứng.";
      }

      const s4 = parseFloat(form.score4) || 0;
      if (s4 > THRESHOLDS.score4 && !form.evidenceUrl4) {
        e.evidenceUrl4 = "Bạn tự đánh giá điểm mục 4 > 22.5 nên cần đính kèm file minh chứng.";
      }

      const s5 = parseFloat(form.score5) || 0;
      if (s5 >= THRESHOLDS.score5 && !form.evidenceUrl5) {
        e.evidenceUrl5 = "Bạn tự đánh giá điểm mục 5 >= 9 nên cần đính kèm file minh chứng.";
      }

      const s6 = parseFloat(form.score6) || 0;
      if (s6 > 0 && !form.evidenceUrl6) {
        e.evidenceUrl6 = "Bạn có điểm thưởng mục 6 nên bắt buộc đính kèm file minh chứng.";
      }
    } else if (stepNum === 3) {
      if (!form.password.trim()) {
        e.password = "Mật khẩu không được để trống.";
      } else if (form.password.trim().length < 8 || form.password.trim().length > 12) {
        e.password = "Mật khẩu phải từ 8 đến 12 ký tự.";
      }

      if (!form.agreeTruth) {
        e.agreeTruth = "Bạn cần cam đoan tính chính xác của các thông tin đã điền.";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setDirection("next");
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setDirection("prev");
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditStep = (targetStep: number) => {
    setDirection(targetStep > step ? "next" : "prev");
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitForm = async () => {
    if (!validate(1) || !validate(2) || !validate(3)) return;
    setIsSubmitting(true);

    try {
      // Capturing client IP silently
      let clientIp = "Unknown";
      try {
        const ipRes = await fetch("/api/get-ip");
        const ipJson = await ipRes.json();
        clientIp = ipJson.ip || "Unknown";
      } catch { /* ignore */ }

      const s1 = parseFloat(form.score1) || 0;
      const s2 = parseFloat(form.score2) || 0;
      const s3 = parseFloat(form.score3) || 0;
      const s4 = parseFloat(form.score4) || 0;
      const s5 = parseFloat(form.score5) || 0;
      const s6 = parseFloat(form.score6) || 0;
      const finalScore = Math.min(100, s1 + s2 + s3 + s4 + s5 + s6);

      const answers = {
        ho_va_ten_lot: form.lastName,
        ten_rieng: form.firstName,
        ho_va_ten: form.fullName,
        mssv: form.studentId,
        email: form.email,
        diem_1: s1.toString(),
        diem_2: s2.toString(),
        diem_3: s3.toString(),
        diem_4: s4.toString(),
        diem_5: s5.toString(),
        diem_6: s6.toString(),
        tong_diem: finalScore.toString(),
        minh_chung_1: form.evidenceUrl1,
        minh_chung_2: form.evidenceUrl2,
        minh_chung_3: form.evidenceUrl3,
        minh_chung_4: form.evidenceUrl4,
        minh_chung_5: form.evidenceUrl5,
        minh_chung_6: form.evidenceUrl6,
        y_kien_thac_mac: form.inquiry,
        mat_khau: form.password,
        ip_client: clientIp,
        submitted_at: new Date().toLocaleString("vi-VN"),
      };

      const payload = {
        formId: "danh-gia-dr-mt23khm3-hk252",
        formTitle: "Tự đánh giá điểm rèn luyện sinh viên (MT23KHM3) HK252",
        sheetName: "MT23KHM3_HK252",
        formType: "training_point",
        questions: Object.keys(answers).map((k) => ({ id: k, question: k })),
        answers,
        submittedAt: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      };

      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        // Save submission locally
        localStorage.setItem(LS_SUBMITTED, "true");
        localStorage.setItem(LS_SUBMITTED_DATA, JSON.stringify(form));
        localStorage.removeItem(LS_DRAFT);
        
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(json.message || "Gửi biểu mẫu không thành công.");
      }
    } catch (err) {
      alert("❌ Lỗi xảy ra khi nộp biểu mẫu. Vui lòng kiểm tra kết nối mạng và thử lại.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    "Thông tin sinh viên",
    "Tự đánh giá kết quả",
    "Hoàn thành tự đánh giá",
    "Xem lại & Gửi",
  ];

  return (
    <div className="w-full overflow-x-hidden pb-12 pt-20 sm:pt-24 select-none">
      {/* ── Fixed Sticky Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/85 dark:border-slate-800/60 shadow-sm py-3"
            : "bg-transparent py-4 sm:py-5"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-10 h-10 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl shadow-sm">
              <Image src={hcmutLogo} alt="HCMUT Logo" fill className="object-contain p-1.5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight truncate tracking-tight">
                Tự đánh giá điểm rèn luyện
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Lớp MT23KHM3 — Học kỳ 252
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-9 h-9 flex-shrink-0 bg-white/70 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-1.5 shadow-sm">
              <Image src={bdcLogo} alt="BDC Logo" fill className="object-contain p-1.5" />
            </div>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/60 mx-1" />
            <ThemeToggle size={16} className="!rounded-xl !p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" />
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 sm:py-3.5">
        
        {/* Dynamic Progress indicator (Only on Form filling screens) */}
        {!isSubmitted && !alreadySubmitted && (
          <div className="mb-8 mt-2 bg-white/40 dark:bg-slate-900/20 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/30 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 transition-all">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0 rounded-full border-2 border-cyan-500/30 flex items-center justify-center font-black text-cyan-600 dark:text-cyan-400 text-sm shadow-sm bg-white dark:bg-slate-950">
                {percentage}%
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-205">Tiến trình hoàn tất biểu mẫu</p>
                <p className="text-[10px] text-slate-550 dark:text-slate-400 font-semibold">Đã điền {completed} trên {total} trường dữ liệu</p>
              </div>
            </div>
            <div className="w-full sm:w-48 h-2 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Restore Draft Toast notification */}
        {draftRestored && !isSubmitted && !alreadySubmitted && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hệ thống đã khôi phục bản nháp rèn luyện được lưu trước đó của bạn.
          </div>
        )}

        {/* Wizard Box */}
        <div className="relative z-20 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/85 dark:border-slate-800/60 rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-100/70 dark:shadow-none transition-all duration-300">
          
          {isSubmitted ? (
            <Success
              name={form.firstName ? `${form.lastName} ${form.firstName}` : form.fullName}
              studentId={form.studentId}
              score={Math.min(100, (parseFloat(form.score1) || 0) + (parseFloat(form.score2) || 0) + (parseFloat(form.score3) || 0) + (parseFloat(form.score4) || 0) + (parseFloat(form.score5) || 0) + (parseFloat(form.score6) || 0))}
              onViewDetails={() => {
                setIsSubmitted(false);
                setAlreadySubmitted(true);
              }}
              onRestart={() => {
                localStorage.removeItem(LS_SUBMITTED);
                localStorage.removeItem(LS_SUBMITTED_DATA);
                setForm(EMPTY_FORM);
                setStep(1);
                setIsSubmitted(false);
              }}
            />
          ) : alreadySubmitted ? (
            <AlreadySubmitted onClear={handleClearSubmitted} />
          ) : (
            <>
              {/* Stepper Header Indicator */}
              <div className="relative flex items-center justify-between w-full mb-8 pb-4 border-b border-slate-100 dark:border-slate-850/40">
                {stepsList.map((label, idx) => {
                  const s = idx + 1;
                  const isActive = step === s;
                  const isCompleted = step > s;

                  return (
                    <button
                      key={s}
                      disabled={s > step && !validate(step)}
                      onClick={() => handleEditStep(s)}
                      className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none disabled:cursor-not-allowed"
                    >
                      <div
                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-black transition-all duration-300 flex-shrink-0
                          ${isActive ? "border-cyan-500 bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-650"}`}
                      >
                        {isCompleted ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          s
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold hidden md:inline-block transition-colors duration-250
                          ${isActive ? "text-cyan-600 dark:text-cyan-400" : isCompleted ? "text-slate-700 dark:text-slate-350" : "text-slate-400 dark:text-slate-600"}`}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Wizard Content Screen */}
              <div key={step} className={`relative z-10 ${direction === "next" ? "animate-slide-next" : "animate-slide-prev"}`}>
                {step === 1 && <Step1 data={form} errors={errors} onChange={setField} />}
                {step === 2 && (
                  <Step2
                    data={form}
                    errors={errors}
                    onChange={setField}
                    onUploaded={handleEvidenceUploaded}
                    onUploading={setIsUploading}
                  />
                )}
                {step === 3 && (
                  <Step3
                    data={form}
                    errors={errors}
                    onChange={setField}
                    onToggleAgree={() => setForm((p) => ({ ...p, agreeTruth: !p.agreeTruth }))}
                  />
                )}
                {step === 4 && <Step4 data={form} onEditStep={handleEditStep} />}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  onClick={handlePrev}
                  disabled={step === 1}
                  className={`group relative flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95
                    ${step === 1 ? "opacity-0 pointer-events-none" : "text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Quay lại
                </button>

                {step < 4 ? (
                  <button
                    onClick={handleNext}
                    disabled={isUploading}
                    className={`group relative flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all duration-250 active:scale-95 shadow-sm shadow-cyan-900/10 dark:shadow-cyan-950/20 ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    Tiếp tục
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitForm}
                    disabled={isSubmitting || isUploading}
                    className={`group relative flex items-center justify-center px-7 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm shadow-cyan-900/10 dark:shadow-cyan-950/20 ${(isSubmitting || isUploading) ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang nộp...
                      </div>
                    ) : (
                      <>
                        Nộp biểu mẫu
                        <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Contact/Inquiry support notice */}
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/30 rounded-2xl py-3.5 px-5 max-w-md mx-auto shadow-sm">
          <span>
            Mọi thắc mắc về điểm rèn luyện vui lòng liên hệ Ban cán sự lớp MT23KHM3 hoặc qua email ban chủ nhiệm:{" "}
            <a href="mailto:bdc@hcmut.edu.vn" className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold">bdc@hcmut.edu.vn</a>.
          </span>
        </div>

        {/* Footer */}
        <footer className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400/80 dark:text-slate-500/80">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-7 opacity-40 hover:opacity-75 transition-opacity">
              <Image src={hcmutLogo} alt="HCMUT Logo" fill className="object-contain" />
            </div>
            <div className="relative w-10 h-7 opacity-40 hover:opacity-75 transition-opacity">
              <Image src={bdcLogo} alt="BDC Logo" fill className="object-contain" />
            </div>
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
