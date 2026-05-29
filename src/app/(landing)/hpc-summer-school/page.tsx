"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";

// ─── Assets ──────────────────────────────────────────────────────────────────
import hpcLogo from "@/assets/hpc-school-logo.png";
import hcmutLogo from "@/assets/hcmut.png";
import hpccLogo from "@/assets/hpcc-logo.png";
import cseLogo from "@/assets/CSE_logo.png";
import bdcLogo from "@/assets/bdclogo.png";
import doanLogo from "@/assets/logo-Doan.png";
import hoiLogo from "@/assets/logo-Hoi.png";

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang = "en" | "vi";

interface FormData {
  agreePrivacy: boolean;
  fullName: string;
  dob: string;
  studentId: string;
  emailUni: string;
  emailPersonal: string;
  phone: string;
  university: string;
  major: string;
  year: string;
  gpa: string;
  cvFile: File | null;
  cvUrl: string;
  researchInterests: string;
  publications: string;
  motivation: string;
  achievements: string;
  futurePlans: string;
  source: string;
  sourceOther: string;
}

interface Errors {
  [key: string]: string;
}

// ─── Organizers ───────────────────────────────────────────────────────────────
const ORGANIZERS = [
  { src: hcmutLogo,  alt: "HCMUT" },
  { src: hpccLogo,   alt: "HPCC" },
  { src: cseLogo,    alt: "CSE" },
  { src: bdcLogo,    alt: "Big Data Club" },
  { src: doanLogo,   alt: "Youth Union" },
  { src: hoiLogo,    alt: "Student Association" },
];

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  en: {
    tagline: "HPCC × CSE × Big Data Club — HCMUT",
    title: "HPC SUMMER SCHOOL",
    year: "2026",
    subtitle: "Start Local · Compute at Scale",
    langToggle: "Tiếng Việt",

    highlights: [
      { label: "Duration",  value: "3-Day Intensive" },
      { label: "Format",    value: "Hackathon & Workshops" },
      { label: "Topics",    value: "HPC · AI · GPU · Systems" },
    ],

    steps: ["Privacy & Data Protection", "Personal & Academic Info", "Technical Profile & Motivation"],

    // Step 1
    privacyTitle: "Privacy & Data Protection Commitment",
    privacyDesc:
      "We are committed to protecting participant information responsibly, transparently, and securely. All submitted data is collected strictly for academic evaluation, communication, and program organization purposes.",
    privacyCommitments: [
      "Your information will never be sold or used for commercial advertising purposes.",
      "Uploaded CVs and materials are only accessible by authorized selection committee members.",
      "Data is securely stored and protected against unauthorized access or disclosure.",
      "Personal information will not be publicly disclosed without your explicit consent.",
    ],
    privacyCollectedTitle: "Information We May Collect",
    privacyCollected: [
      "Personal identification & contact details",
      "Academic background & cumulative GPA",
      "Scientific publications & research projects",
      "CV and portfolio materials",
      "Research interests & career orientation",
      "Program feedback & survey responses",
    ],
    privacyCheckLabel: "I have read and agree to the Privacy & Data Protection Policy.",
    privacyCheckDesc:
      "By checking this box, you consent to HPCC & BDC using your information for the HPC Summer School 2026 selection and program management process.",
    privacyError: "You must agree to the privacy policy to proceed.",

    // Step 2 labels
    step2Title: "Personal & Academic Information",
    step2Desc: "Please provide accurate information to facilitate contact and verification by the organizing committee.",
    fullName: "Full Name",
    fullNamePh: "Nguyen Van A",
    dob: "Date of Birth",
    studentId: "Student ID (MSSV)",
    studentIdPh: "231xxxx",
    phone: "Phone Number",
    phonePh: "+84 9xx xxx xxx",
    emailUni: "University Email (.edu.vn)",
    emailUniPh: "nguyen.vana@hcmut.edu.vn",
    emailPersonal: "Personal Email",
    emailPersonalPh: "nguyenvana@gmail.com",
    university: "Current University",
    universityPh: "Ho Chi Minh City University of Technology",
    major: "Faculty / Major",
    majorPh: "e.g. Computer Science",
    yearOfStudy: "Year of Study",
    yearPh: "-- Select year --",
    years: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5+", "Graduate"],
    gpa: "Cumulative GPA",
    gpaPh: "e.g. 3.52 / 4.0",

    // Errors step 2
    errFullName:   "Full name is required.",
    errStudentId:  "Student ID is required.",
    errEmailUni:   "University email is required.",
    errEmailFmt:   "Please enter a valid email address.",
    errPhone:      "Phone number is required.",
    errUniversity: "University name is required.",
    errMajor:      "Faculty / Major is required.",
    errYear:       "Please select your year of study.",
    errGpa:        "Cumulative GPA is required.",

    // Step 3 labels
    step3Title: "Technical Profile & Motivation",
    step3Desc:  "Help us understand your passion, research background, and reasons for applying.",

    cvLabel:    "Upload Your CV (PDF, max 5 MB)",
    cvDrag:     "Drag & drop your file here, or",
    cvClick:    "click to browse",
    cvHint:     "Accepted format: .PDF · Maximum size: 5 MB",
    cvUploading: "Uploading to Cloudinary…",
    cvSuccess:  "Uploaded successfully · Click to replace",

    researchLabel:  "Research Interests & Orientation",
    researchHint:   "Describe the fields you are currently exploring or wish to pursue (e.g. HPC, GPU Computing, Distributed AI, Systems Programming…)",
    researchPh:     "e.g. I am interested in GPU Programming with CUDA and distributed machine learning training on HPC clusters…",

    pubLabel:  "Scientific Publications / Notable Research Projects (if any)",
    pubHint:   "List paper titles, conference/journal names, or provide links. Leave blank if not applicable.",
    pubPh:     "e.g.\n• [SOSP'25] Paper Title — Conference Name\n• Research Project: Title — Role: Research Member\n• https://arxiv.org/abs/...",

    motivationLabel: "Motivation Statement",
    motivationHint:  "What do you hope to learn and achieve over the 3 days of HPC Summer School 2026?",
    motivationPh:    "Share your motivation and goals…",

    achievementsLabel: "Academic & Research Achievements (if any)",
    achievementsPh:    "Awards, personal projects, scholarships, competitions…",

    futurePlansLabel: "Future Career Plans",
    futurePlansPh:    "Career goals, research directions you plan to pursue…",

    // Source section
    sourceTitle:  "How Did You Hear About Us?",
    sourceDesc:   "Help us understand how applicants discover HPC Summer School.",
    sourceLabel:  "Primary information source",
    sourcePh:     "-- Select a source --",
    sourceOptions: [
      { value: "HPCC Fanpage",     label: "HPCC HCMUT Official Fanpage" },
      { value: "BDC Fanpage",      label: "Big Data Club (BDC) Official Fanpage" },
      { value: "University Portal",label: "University Website / Student Portal" },
      { value: "Friend Referral",  label: "Referred by a Friend or Classmate" },
      { value: "Faculty/Advisor",  label: "Recommended by a Lecturer or Academic Advisor" },
      { value: "Email Newsletter", label: "University or Club Email Newsletter" },
      { value: "Other",            label: "Other" },
    ],
    sourceOtherLabel: "Please specify",
    sourceOtherPh:    "e.g. LinkedIn, a research group, etc.",

    // Errors step 3
    errCvRequired:   "Please upload your CV before submitting.",
    errCvUploading:  "Please wait for the file upload to complete.",
    errCvFailed:     "Upload failed. Please try again.",
    errCvType:       "Only PDF files are accepted.",
    errCvSize:       "File exceeds the 5 MB size limit.",
    errResearch:     "Please describe your research interests.",
    errMotivation:   "Please provide your motivation statement.",

    // Navigation
    back:   "Back",
    next:   "Continue",
    submit: "Submit Application",
    submitting: "Submitting…",

    // Success
    successTag:    "Application Submitted",
    successTitle1: "Thank you,",
    successTitle2: "for applying!",
    successDesc:
      "Your application has been successfully submitted to the HPC Summer School 2026 selection committee. We will review all submissions and notify you of the outcome via email as soon as possible.",
    followUs:  "Stay up to date at:",
    links: [
      { label: "HPCC HCMUT",    href: "https://hpcc.hcmut.edu.vn/",             color: "text-cyan-400 hover:text-cyan-300" },
      { label: "BDC Hub",        href: "https://bdc.hpcc.vn/",                   color: "text-blue-400 hover:text-blue-300" },
      { label: "Facebook HPCC",  href: "https://www.facebook.com/hpcc.hcmut",    color: "text-indigo-400 hover:text-indigo-300" },
    ],
    copyright: "© 2026 High-Performance Computing Center — HCMUT. All rights reserved.",
  },

  vi: {
    tagline: "HPCC × CSE × Big Data Club — HCMUT",
    title: "HPC SUMMER SCHOOL",
    year: "2026",
    subtitle: "Start Local · Compute at Scale",
    langToggle: "English",

    highlights: [
      { label: "Thời lượng", value: "3 ngày thực chiến" },
      { label: "Định dạng",  value: "Hackathon & Workshop" },
      { label: "Chủ đề",    value: "HPC · AI · GPU · Systems" },
    ],

    steps: ["Quyền Riêng Tư", "Thông Tin Cá Nhân", "Hồ Sơ & Nguyện Vọng"],

    // Step 1
    privacyTitle: "Cam Kết Quyền Riêng Tư & Bảo Mật Dữ Liệu",
    privacyDesc:
      "Chúng tôi cam kết bảo vệ thông tin người tham gia một cách có trách nhiệm, minh bạch và an toàn. Mọi thông tin chỉ được thu thập phục vụ mục đích xét tuyển học thuật và tổ chức chương trình.",
    privacyCommitments: [
      "Thông tin của bạn không bao giờ được bán hoặc dùng cho mục đích thương mại.",
      "CV và tài liệu tải lên chỉ ban tuyển sinh mới có quyền truy cập.",
      "Dữ liệu được lưu trữ an toàn và bảo vệ khỏi truy cập trái phép.",
      "Thông tin cá nhân sẽ không bị tiết lộ công khai khi chưa có sự đồng ý của bạn.",
    ],
    privacyCollectedTitle: "Thông Tin Chúng Tôi Có Thể Thu Thập",
    privacyCollected: [
      "Thông tin định danh & liên hệ cá nhân",
      "Nền tảng học thuật & GPA tích lũy",
      "Bài báo khoa học & đề tài nghiên cứu",
      "CV và hồ sơ cá nhân",
      "Lĩnh vực quan tâm & định hướng nghiên cứu",
      "Phản hồi & khảo sát chương trình",
    ],
    privacyCheckLabel: "Tôi đã đọc và đồng ý với chính sách bảo mật dữ liệu.",
    privacyCheckDesc:
      "Bằng việc đánh dấu vào ô này, bạn đồng ý cho phép HPCC & BDC sử dụng thông tin của bạn cho quá trình tuyển sinh HPC Summer School 2026.",
    privacyError: "Bạn cần đồng ý với chính sách bảo mật để tiếp tục.",

    // Step 2 labels
    step2Title: "Thông Tin Cá Nhân & Học Thuật",
    step2Desc:  "Vui lòng cung cấp thông tin chính xác để ban tổ chức tiện liên hệ và xét tuyển.",
    fullName: "Họ và tên",
    fullNamePh: "Nguyễn Văn A",
    dob: "Ngày sinh",
    studentId: "MSSV",
    studentIdPh: "231xxxx",
    phone: "Số điện thoại",
    phonePh: "09xx xxx xxx",
    emailUni: "Email sinh viên (.edu.vn)",
    emailUniPh: "nguyen.vana@hcmut.edu.vn",
    emailPersonal: "Email cá nhân",
    emailPersonalPh: "nguyenvana@gmail.com",
    university: "Trường đang theo học",
    universityPh: "Trường Đại học Bách Khoa – ĐHQG-HCM",
    major: "Khoa / Ngành học",
    majorPh: "VD: Khoa học Máy tính",
    yearOfStudy: "Năm học",
    yearPh: "-- Chọn năm --",
    years: ["Năm 1", "Năm 2", "Năm 3", "Năm 4", "Năm 5+", "Đã tốt nghiệp"],
    gpa: "GPA tích lũy",
    gpaPh: "VD: 3.52 / 4.0",

    errFullName:   "Vui lòng nhập họ và tên.",
    errStudentId:  "Vui lòng nhập MSSV.",
    errEmailUni:   "Vui lòng nhập email trường.",
    errEmailFmt:   "Email không hợp lệ.",
    errPhone:      "Vui lòng nhập số điện thoại.",
    errUniversity: "Vui lòng nhập tên trường đang theo học.",
    errMajor:      "Vui lòng nhập khoa / ngành học.",
    errYear:       "Vui lòng chọn năm học.",
    errGpa:        "Vui lòng nhập GPA tích lũy.",

    step3Title: "Hồ Sơ Kỹ Thuật & Nguyện Vọng",
    step3Desc:  "Hãy cho chúng tôi biết về đam mê, nền tảng nghiên cứu và lý do bạn muốn tham gia.",

    cvLabel:     "Tải lên CV của bạn (PDF, tối đa 5MB)",
    cvDrag:      "Kéo thả file vào đây hoặc",
    cvClick:     "click để chọn",
    cvHint:      "Chỉ chấp nhận định dạng .PDF · Tối đa 5MB",
    cvUploading: "Đang tải lên Cloudinary…",
    cvSuccess:   "Đã tải lên thành công · Click để thay đổi",

    researchLabel: "Lĩnh vực quan tâm & Định hướng nghiên cứu",
    researchHint:  "Mô tả các lĩnh vực bạn đang hoặc muốn theo đuổi (HPC, GPU Computing, Distributed AI, Systems Programming…)",
    researchPh:    "VD: Tôi quan tâm đến GPU Programming với CUDA và Distributed ML Training trên HPC clusters…",

    pubLabel: "Bài báo khoa học / Đề tài nghiên cứu nổi bật (nếu có)",
    pubHint:  "Liệt kê tên bài báo, hội nghị/tạp chí hoặc đính kèm link. Để trống nếu chưa có.",
    pubPh:    "VD:\n• [SOSP'25] Tên bài báo — Conference Name\n• Đề tài NCKH: Tên đề tài — Vai trò: Thành viên\n• https://arxiv.org/abs/...",

    motivationLabel: "Nguyện vọng tham gia",
    motivationHint:  "Bạn mong muốn học hỏi và đạt được điều gì sau 3 ngày của HPC Summer School 2026?",
    motivationPh:    "Chia sẻ nguyện vọng và mục tiêu của bạn…",

    achievementsLabel: "Thành tích học tập / nghiên cứu khác (nếu có)",
    achievementsPh:    "Giải thưởng, dự án cá nhân, học bổng, cuộc thi…",

    futurePlansLabel: "Dự định tương lai",
    futurePlansPh:    "Định hướng nghề nghiệp, hướng nghiên cứu tiếp theo…",

    sourceTitle:  "Bạn Biết Đến Chương Trình Qua Đâu?",
    sourceDesc:   "Thông tin này giúp chúng tôi hiểu rõ hơn về kênh tiếp cận của người đăng ký.",
    sourceLabel:  "Nguồn thông tin chính",
    sourcePh:     "-- Chọn nguồn thông tin --",
    sourceOptions: [
      { value: "Fanpage HPCC",      label: "Fanpage chính thức HPCC HCMUT" },
      { value: "Fanpage BDC",       label: "Fanpage chính thức Big Data Club (BDC)" },
      { value: "Cổng thông tin",    label: "Website / Cổng thông tin trường" },
      { value: "Bạn bè",           label: "Bạn bè / Người quen giới thiệu" },
      { value: "Giảng viên",        label: "Giảng viên / Thầy cô giới thiệu" },
      { value: "Email newsletter",  label: "Email thông báo của trường / CLB" },
      { value: "Khác",              label: "Khác" },
    ],
    sourceOtherLabel: "Vui lòng ghi rõ",
    sourceOtherPh:    "VD: LinkedIn, nhóm nghiên cứu, v.v.",

    errCvRequired:  "Vui lòng tải lên CV trước khi nộp đơn.",
    errCvUploading: "Vui lòng chờ file tải lên hoàn tất.",
    errCvFailed:    "Tải lên thất bại. Vui lòng thử lại.",
    errCvType:      "Chỉ chấp nhận file PDF.",
    errCvSize:      "File vượt quá giới hạn 5MB.",
    errResearch:    "Vui lòng điền định hướng nghiên cứu.",
    errMotivation:  "Vui lòng chia sẻ nguyện vọng tham gia.",

    back:   "Quay lại",
    next:   "Tiếp tục",
    submit: "Nộp Đơn Đăng Ký",
    submitting: "Đang gửi đơn…",

    successTag:    "Đăng ký thành công",
    successTitle1: "Cảm ơn bạn,",
    successTitle2: "đã nộp đơn!",
    successDesc:
      "Hồ sơ của bạn đã được gửi thành công đến ban tuyển sinh HPC Summer School 2026. Chúng tôi sẽ xét duyệt và thông báo kết quả qua email sớm nhất có thể.",
    followUs: "Theo dõi thông tin mới nhất tại:",
    links: [
      { label: "HPCC HCMUT",   href: "https://hpcc.hcmut.edu.vn/",          color: "text-cyan-400 hover:text-cyan-300" },
      { label: "BDC Hub",       href: "https://bdc.hpcc.vn/",                color: "text-blue-400 hover:text-blue-300" },
      { label: "Facebook HPCC", href: "https://www.facebook.com/hpcc.hcmut", color: "text-indigo-400 hover:text-indigo-300" },
    ],
    copyright: "© 2026 Trung tâm Tính toán Hiệu năng Cao — HCMUT. All rights reserved.",
  },
} as const;

// Derived union so both locales are accepted in component props
type Translation = typeof T["en"] | typeof T["vi"];

// ─── Shared Field Components ──────────────────────────────────────────────────

const inputBase =
  "w-full bg-[#0A1628] border rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/60 transition-all duration-200";

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-300 mb-2">
      {children}
      {required && <span className="text-cyan-400 ml-1">*</span>}
    </label>
  );
}

function ErrMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      {msg}
    </p>
  );
}

function FInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <>
      <input
        {...props}
        className={`${inputBase} ${error ? "border-red-500/60 bg-red-950/10" : "border-white/10 hover:border-white/20"}`}
      />
      <ErrMsg msg={error} />
    </>
  );
}

function FTextarea({
  error,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <>
      <textarea
        rows={rows}
        {...props}
        className={`${inputBase} resize-none ${error ? "border-red-500/60 bg-red-950/10" : "border-white/10 hover:border-white/20"}`}
      />
      <ErrMsg msg={error} />
    </>
  );
}

function FSelect({
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <>
      <select
        {...props}
        className={`${inputBase} appearance-none cursor-pointer ${error ? "border-red-500/60" : "border-white/10 hover:border-white/20"}`}
      >
        {children}
      </select>
      <ErrMsg msg={error} />
    </>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1Privacy({
  t,
  agreed,
  onToggle,
  error,
}: {
  t: Translation;
  agreed: boolean;
  onToggle: () => void;
  error?: string;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-2">
          <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white">{t.privacyTitle}</h2>
        <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed text-sm">{t.privacyDesc}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {t.privacyCommitments.map((item, i) => (
          <div key={i} className="flex items-start gap-3 bg-[#0A1628] border border-white/8 rounded-2xl p-5 hover:border-cyan-500/20 transition-colors">
            <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      <div className="border border-cyan-500/15 bg-cyan-500/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-cyan-300 mb-4 uppercase tracking-wider">{t.privacyCollectedTitle}</h3>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {t.privacyCollected.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div
        onClick={onToggle}
        className={`flex items-start gap-4 border rounded-2xl p-5 cursor-pointer transition-all duration-200 select-none
          ${agreed ? "border-cyan-500/40 bg-cyan-500/8" : "border-white/10 bg-white/3 hover:border-white/20"}
          ${error ? "border-red-500/50" : ""}`}
      >
        <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${agreed ? "bg-cyan-500 border-cyan-500" : "border-slate-600"}`}>
          {agreed && (
            <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{t.privacyCheckLabel}</p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.privacyCheckDesc}</p>
          {error && <p className="mt-2 text-xs text-red-400">⚠ {error}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2Personal({
  t,
  data,
  errors,
  onChange,
}: {
  t: Translation;
  data: FormData;
  errors: Errors;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">{t.step2Title}</h2>
        <p className="text-slate-400 text-sm">{t.step2Desc}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel required>{t.fullName}</FieldLabel>
          <FInput type="text" placeholder={t.fullNamePh} value={data.fullName} onChange={(e) => onChange("fullName", e.target.value)} error={errors.fullName} />
        </div>
        <div>
          <FieldLabel>{t.dob}</FieldLabel>
          <FInput type="date" value={data.dob} onChange={(e) => onChange("dob", e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel required>{t.studentId}</FieldLabel>
          <FInput type="text" placeholder={t.studentIdPh} value={data.studentId} onChange={(e) => onChange("studentId", e.target.value)} error={errors.studentId} />
        </div>
        <div>
          <FieldLabel required>{t.phone}</FieldLabel>
          <FInput type="tel" placeholder={t.phonePh} value={data.phone} onChange={(e) => onChange("phone", e.target.value)} error={errors.phone} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel required>{t.emailUni}</FieldLabel>
          <FInput type="email" placeholder={t.emailUniPh} value={data.emailUni} onChange={(e) => onChange("emailUni", e.target.value)} error={errors.emailUni} />
        </div>
        <div>
          <FieldLabel>{t.emailPersonal}</FieldLabel>
          <FInput type="email" placeholder={t.emailPersonalPh} value={data.emailPersonal} onChange={(e) => onChange("emailPersonal", e.target.value)} />
        </div>
      </div>

      <div>
        <FieldLabel required>{t.university}</FieldLabel>
        <FInput type="text" placeholder={t.universityPh} value={data.university} onChange={(e) => onChange("university", e.target.value)} error={errors.university} />
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div className="sm:col-span-1">
          <FieldLabel required>{t.major}</FieldLabel>
          <FInput type="text" placeholder={t.majorPh} value={data.major} onChange={(e) => onChange("major", e.target.value)} error={errors.major} />
        </div>
        <div>
          <FieldLabel required>{t.yearOfStudy}</FieldLabel>
          <FSelect value={data.year} onChange={(e) => onChange("year", e.target.value)} error={errors.year}>
            <option value="">{t.yearPh}</option>
            {t.years.map((y) => <option key={y} value={y}>{y}</option>)}
          </FSelect>
        </div>
        <div>
          <FieldLabel required>{t.gpa}</FieldLabel>
          <FInput type="text" placeholder={t.gpaPh} value={data.gpa} onChange={(e) => onChange("gpa", e.target.value)} error={errors.gpa} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3Profile({
  t,
  data,
  errors,
  onChange,
  onFileChange,
  uploadingCv,
}: {
  t: Translation;
  data: FormData;
  errors: Errors;
  onChange: (field: keyof FormData, value: string) => void;
  onFileChange: (file: File) => void;
  uploadingCv: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showSourceOther = data.source === "Other" || data.source === "Khác";

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">{t.step3Title}</h2>
        <p className="text-slate-400 text-sm">{t.step3Desc}</p>
      </div>

      {/* CV Upload */}
      <div>
        <FieldLabel required>{t.cvLabel}</FieldLabel>
        <div
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFileChange(f); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group
            ${errors.cvFile ? "border-red-500/40 bg-red-950/10"
              : data.cvUrl ? "border-cyan-500/40 bg-cyan-500/5 hover:border-cyan-500/60"
              : "border-white/15 bg-white/2 hover:border-cyan-500/30 hover:bg-cyan-500/3"}`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileChange(f); }} />

          {uploadingCv ? (
            <div className="space-y-3">
              <div className="w-10 h-10 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto" />
              <p className="text-cyan-300 font-medium text-sm">{t.cvUploading}</p>
            </div>
          ) : data.cvUrl ? (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-cyan-400 font-semibold text-sm">{data.cvFile?.name}</p>
              <p className="text-xs text-slate-400">{t.cvSuccess}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5 transition-all">
                <svg className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-slate-300 font-medium text-sm group-hover:text-white transition-colors">
                {t.cvDrag}{" "}
                <span className="text-cyan-400">{t.cvClick}</span>
              </p>
              <p className="text-xs text-slate-500">{t.cvHint}</p>
            </div>
          )}
        </div>
        <ErrMsg msg={errors.cvFile} />
      </div>

      {/* Research Interests */}
      <div>
        <FieldLabel required>{t.researchLabel}</FieldLabel>
        <p className="text-xs text-slate-500 mb-2">{t.researchHint}</p>
        <FTextarea rows={3} placeholder={t.researchPh} value={data.researchInterests}
          onChange={(e) => onChange("researchInterests", e.target.value)} error={errors.researchInterests} />
      </div>

      {/* Publications */}
      <div>
        <FieldLabel>{t.pubLabel}</FieldLabel>
        <p className="text-xs text-slate-500 mb-2">{t.pubHint}</p>
        <FTextarea rows={3} placeholder={t.pubPh} value={data.publications}
          onChange={(e) => onChange("publications", e.target.value)} />
      </div>

      {/* Motivation */}
      <div>
        <FieldLabel required>{t.motivationLabel}</FieldLabel>
        <p className="text-xs text-slate-500 mb-2">{t.motivationHint}</p>
        <FTextarea rows={4} placeholder={t.motivationPh} value={data.motivation}
          onChange={(e) => onChange("motivation", e.target.value)} error={errors.motivation} />
      </div>

      {/* Achievements + Future */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel>{t.achievementsLabel}</FieldLabel>
          <FTextarea rows={3} placeholder={t.achievementsPh} value={data.achievements}
            onChange={(e) => onChange("achievements", e.target.value)} />
        </div>
        <div>
          <FieldLabel>{t.futurePlansLabel}</FieldLabel>
          <FTextarea rows={3} placeholder={t.futurePlansPh} value={data.futurePlans}
            onChange={(e) => onChange("futurePlans", e.target.value)} />
        </div>
      </div>

      {/* ── How Did You Hear About Us — dedicated section ── */}
      <div className="border border-white/8 bg-white/2 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{t.sourceTitle}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{t.sourceDesc}</p>
          </div>
        </div>

        <div>
          <FieldLabel>{t.sourceLabel}</FieldLabel>
          <FSelect value={data.source} onChange={(e) => onChange("source", e.target.value)}>
            <option value="">{t.sourcePh}</option>
            {t.sourceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </FSelect>
        </div>

        {showSourceOther && (
          <div>
            <FieldLabel>{t.sourceOtherLabel}</FieldLabel>
            <FInput type="text" placeholder={t.sourceOtherPh} value={data.sourceOther}
              onChange={(e) => onChange("sourceOther", e.target.value)} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ t, name }: { t: Translation; name: string }) {
  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-600/8 rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border-2 border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center">
            <svg className="w-14 h-14 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-ping" />
        </div>

        <div className="space-y-3">
          <p className="text-cyan-400 uppercase tracking-[0.3em] text-xs font-semibold">{t.successTag}</p>
          <h2 className="text-3xl font-black text-white leading-tight">
            {t.successTitle1}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {name || "Applicant"}
            </span>
            {" "}{t.successTitle2}
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">{t.successDesc}</p>
        </div>

        <div className="border border-white/8 bg-white/3 rounded-2xl p-6 space-y-4">
          <p className="text-slate-500 text-sm">{t.followUs}</p>
          <div className="flex flex-wrap justify-center gap-5">
            {t.links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                className={`text-sm font-semibold transition-colors ${link.color}`}>
                {link.label} →
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5">
          {ORGANIZERS.map((org) => (
            <div key={org.alt} className="relative w-10 h-10">
              <Image src={org.src} alt={org.alt} fill className="object-contain opacity-50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const EMPTY_FORM: FormData = {
  agreePrivacy: false,
  fullName: "", dob: "", studentId: "", emailUni: "", emailPersonal: "",
  phone: "", university: "", major: "", year: "", gpa: "",
  cvFile: null, cvUrl: "", researchInterests: "", publications: "",
  motivation: "", achievements: "", futurePlans: "",
  source: "", sourceOther: "",
};

export default function HPCSummerSchoolPage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [uploadingCv, setUploadingCv] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = t.steps.length;

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleTogglePrivacy = () => {
    setFormData((prev) => ({ ...prev, agreePrivacy: !prev.agreePrivacy }));
    if (errors.agreePrivacy) setErrors((prev) => { const e = { ...prev }; delete e.agreePrivacy; return e; });
  };

  const handleFileChange = async (file: File) => {
    if (file.type !== "application/pdf") {
      setErrors((prev) => ({ ...prev, cvFile: t.errCvType }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, cvFile: t.errCvSize }));
      return;
    }
    setErrors((prev) => { const e = { ...prev }; delete e.cvFile; return e; });
    setFormData((prev) => ({ ...prev, cvFile: file, cvUrl: "" }));
    setUploadingCv(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-cloudinary", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        setFormData((prev) => ({ ...prev, cvUrl: json.url }));
      } else {
        setErrors((prev) => ({ ...prev, cvFile: json.message || t.errCvFailed }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, cvFile: t.errCvFailed }));
    } finally {
      setUploadingCv(false);
    }
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (step === 1) {
      if (!formData.agreePrivacy) e.agreePrivacy = t.privacyError;
    } else if (step === 2) {
      if (!formData.fullName.trim())   e.fullName   = t.errFullName;
      if (!formData.studentId.trim())  e.studentId  = t.errStudentId;
      if (!formData.emailUni.trim())   e.emailUni   = t.errEmailUni;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailUni)) e.emailUni = t.errEmailFmt;
      if (!formData.phone.trim())      e.phone      = t.errPhone;
      if (!formData.university.trim()) e.university = t.errUniversity;
      if (!formData.major.trim())      e.major      = t.errMajor;
      if (!formData.year)              e.year       = t.errYear;
      if (!formData.gpa.trim())        e.gpa        = t.errGpa;
    } else if (step === 3) {
      if (!formData.cvUrl) {
        if (!formData.cvFile)  e.cvFile = t.errCvRequired;
        else if (uploadingCv)  e.cvFile = t.errCvUploading;
        else                   e.cvFile = t.errCvFailed;
      }
      if (!formData.researchInterests.trim()) e.researchInterests = t.errResearch;
      if (!formData.motivation.trim())        e.motivation        = t.errMotivation;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validate()) { setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const prevStep = () => {
    setStep((s) => s - 1); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const answers: Record<string, string> = {
        full_name:          formData.fullName,
        date_of_birth:      formData.dob,
        student_id:         formData.studentId,
        university_email:   formData.emailUni,
        personal_email:     formData.emailPersonal,
        phone:              formData.phone,
        university:         formData.university,
        major:              formData.major,
        year_of_study:      formData.year,
        gpa:                formData.gpa,
        cv_url:             formData.cvUrl,
        research_interests: formData.researchInterests,
        publications:       formData.publications,
        motivation:         formData.motivation,
        achievements:       formData.achievements,
        future_plans:       formData.futurePlans,
        source:             formData.source,
        source_other:       formData.sourceOther,
        form_language:      lang,
      };

      const payload = {
        formId:    "hpc-summer-school-2026-participant",
        formTitle: "Application Form — HPC Summer School 2026",
        sheetName: "HPC_Summer_School_2026",
        formType:  "registration",
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
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      alert("❌ An error occurred while submitting your application. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <SuccessScreen t={t} name={formData.fullName} />;

  const progressPct = Math.round(((step - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-200">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-cyan-700/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-700/8 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* ── Language Toggle ── */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setLang(lang === "en" ? "vi" : "en")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 hover:border-white/20 text-sm font-medium text-slate-300 hover:text-white transition-all duration-200 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
            </svg>
            {t.langToggle}
          </button>
        </div>

        {/* ── Header ── */}
        <header className="mb-10">
          {/* Organizer logos */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            {ORGANIZERS.map((org) => (
              <div key={org.alt} className="relative w-10 h-10 sm:w-12 sm:h-12">
                <Image src={org.src} alt={org.alt} fill className="object-contain opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Event logo + title */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                <Image src={hpcLogo} alt="HPC Summer School Logo" fill className="object-contain drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]" />
              </div>
            </div>
            <div>
              <p className="text-cyan-400 uppercase tracking-[0.35em] text-xs font-semibold mb-2">{t.tagline}</p>
              <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 tracking-tight leading-tight">
                {t.title}<br />{t.year}
              </h1>
              <p className="mt-2 text-slate-400 font-medium tracking-widest text-sm uppercase">{t.subtitle}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {t.highlights.map((item) => (
                <div key={item.label} className="border border-white/10 bg-white/3 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-200">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── Progress ── */}
        <div className="mb-10">
          <div className="relative h-1 bg-white/8 rounded-full mb-6 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between max-w-sm mx-auto">
            {t.steps.map((label, i) => {
              const s = i + 1;
              return (
                <div key={s} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300
                    ${step === s ? "border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                      : step > s  ? "border-cyan-600 bg-cyan-600 text-black"
                      : "border-white/15 bg-white/3 text-slate-500"}`}
                  >
                    {step > s ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : String(s).padStart(2, "0")}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block text-center max-w-[80px] leading-tight ${step >= s ? "text-slate-300" : "text-slate-600"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-[#0A1628]/70 backdrop-blur-xl border border-white/8 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/40">
          {step === 1 && (
            <Step1Privacy t={t} agreed={formData.agreePrivacy} onToggle={handleTogglePrivacy} error={errors.agreePrivacy} />
          )}
          {step === 2 && (
            <Step2Personal t={t} data={formData} errors={errors} onChange={handleChange} />
          )}
          {step === 3 && (
            <Step3Profile t={t} data={formData} errors={errors} onChange={handleChange} onFileChange={handleFileChange} uploadingCv={uploadingCv} />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/8">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 active:scale-95
                ${step === 1 ? "opacity-0 pointer-events-none"
                  : "text-slate-400 hover:text-white hover:bg-white/8 border border-transparent hover:border-white/10"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {t.back}
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/30 transition-all duration-200 active:scale-95"
              >
                {t.next}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || uploadingCv}
                className={`flex items-center gap-2.5 px-10 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/30 transition-all duration-200 active:scale-95
                  ${(submitting || uploadingCv) ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    {t.submit}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="mt-16 text-center space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-5">
            {ORGANIZERS.map((org) => (
              <div key={org.alt} className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image src={org.src} alt={org.alt} fill className="object-contain opacity-40 hover:opacity-70 transition-opacity" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <a href="https://hpcc.hcmut.edu.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">hpcc.hcmut.edu.vn</a>
            <span className="text-slate-700">·</span>
            <a href="https://bdc.hpcc.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">bdc.hpcc.vn</a>
            <span className="text-slate-700">·</span>
            <a href="https://www.facebook.com/hpcc.hcmut" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">facebook.com/hpcc.hcmut</a>
          </div>
          <p className="text-slate-600 text-xs">{t.copyright}</p>
        </footer>
      </div>
    </div>
  );
}
