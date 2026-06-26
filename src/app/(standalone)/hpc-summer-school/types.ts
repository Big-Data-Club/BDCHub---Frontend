import { StaticImageData } from "next/image";
import hpcLogo from "@/assets/hpc-school-logo.png";
import hcmutLogo from "@/assets/hcmut.png";
import hpccLogo from "@/assets/hpcc-logo.png";
import cseLogo from "@/assets/CSE_logo.png";
import bdcLogo from "@/assets/bdclogo.png";
import agentiviumLogo from "@/assets/Agentivium-logo-vertical-dark.png";
import doanLogo from "@/assets/logo-Doan.png";
import hoiLogo from "@/assets/logo-Hoi.png";

export type Lang = "en" | "vi";

export interface FormData {
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

export interface Errors {
  [key: string]: string;
}

export interface Organizer {
  src: StaticImageData;
  alt: string;
  cls: string;
}

export const ORGANIZERS: Organizer[] = [
  { src: hcmutLogo, alt: "HCMUT", cls: "w-6 h-6" },
  { src: hpccLogo, alt: "HPCC", cls: "w-16 h-9" },
  { src: cseLogo, alt: "CSE", cls: "w-6 h-6" },
  { src: bdcLogo, alt: "Big Data Club", cls: "w-6 h-6" },
  { src: agentiviumLogo, alt: "Agentivium", cls: "w-8 h-6" },
  { src: doanLogo, alt: "Youth Union", cls: "w-6 h-6" },
  { src: hoiLogo, alt: "Student Association", cls: "w-6 h-6" },
];

export const T = {
  en: {
    tagline: "HPCC × CSE × Big Data Club - HCMUT",
    title: "HCMUT HPC School 2026",
    subtitle: "Start Local · Compute at Scale",
    langToggle: "Tiếng Việt",
    steps: ["Privacy & Data Protection", "Personal & Academic Info", "Technical Profile & Motivation"],
    privacyTitle: "Privacy & Data Protection Commitment",
    privacyDesc: "We are committed to protecting participant information responsibly, transparently, and securely. All submitted data is collected strictly for academic evaluation, communication, and program organization purposes.",
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
    privacyCheckDesc: "By checking this box, you consent to HPCC & BDC using your information for the HCMUT HPC School 2026 selection and program management process.",
    privacyError: "You must agree to the privacy policy to proceed.",
    step2Title: "Personal & Academic Information",
    step2Desc: "Please provide accurate information to facilitate contact and verification by the organizing committee.",
    fullName: "Full Name", fullNamePh: "Nguyen Van A",
    dob: "Date of Birth",
    studentId: "Student ID (MSSV)", studentIdPh: "231xxxx",
    phone: "Phone Number", phonePh: "+84 9xx xxx xxx",
    emailUni: "University Email (.edu.vn)", emailUniPh: "nguyen.vana@hcmut.edu.vn",
    emailPersonal: "Personal Email", emailPersonalPh: "nguyenvana@gmail.com",
    university: "Current University", universityPh: "Ho Chi Minh City University of Technology",
    major: "Faculty / Major", majorPh: "e.g. Computer Science",
    yearOfStudy: "Year of Study", yearPh: "-- Select year --",
    years: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5+", "Graduate"],
    gpa: "Cumulative GPA", gpaPh: "e.g. 3.52 / 4.0",
    errFullName: "Full name is required.", errStudentId: "Student ID is required.",
    errEmailUni: "University email is required.", errEmailFmt: "Please enter a valid email address.",
    errPhone: "Phone number is required.", errUniversity: "University name is required.",
    errMajor: "Faculty / Major is required.", errYear: "Please select your year of study.",
    errGpa: "Cumulative GPA is required.",
    errGpaScale: "GPA scale is required.",
    errSourceOther: "Please specify where you heard about us.",
    step3Title: "Technical Profile & Motivation",
    step3Desc: "Help us understand your passion, research background, and reasons for applying.",
    cvLabel: "Upload Your CV (PDF, max 5 MB)",
    cvDrag: "Drag & drop your file here, or", cvClick: "click to browse",
    cvHint: "Accepted format: .PDF · Maximum size: 5 MB",
    cvUploading: "Uploading to Cloudinary…", cvSuccess: "Uploaded successfully · Click to replace",
    researchLabel: "Research Interests & Orientation",
    researchHint: "Describe the fields you are currently exploring or wish to pursue",
    researchPh: "e.g. HPC, GPU Computing, Distributed AI, Systems Programming…",
    pubLabel: "Scientific Publications / Notable Research Projects (if any)",
    pubHint: "List paper titles, conference/journal names, or provide links. Leave blank if not applicable.",
    pubPh: "e.g.\n• [SOSP'25] Paper Title - Conference Name\n• Research Project: Title - Role: Research Member\n• https://arxiv.org/abs/...",
    motivationLabel: "Motivation Statement",
    motivationHint: "What do you hope to learn and achieve over the 3 days of HCMUT HPC School 2026?",
    motivationPh: "Share your motivation and goals…",
    achievementsLabel: "Academic & Research Achievements (if any)",
    achievementsPh: "Awards, personal projects, scholarships, competitions…",
    futurePlansLabel: "Future Career Plans",
    futurePlansPh: "Career goals, research directions you plan to pursue…",
    sourceTitle: "How Did You Hear About Us?",
    sourceDesc: "Help us understand how applicants discover HCMUT HPC School.",
    sourceLabel: "Primary information source", sourcePh: "-- Select a source --",
    sourceOptions: [
      { value: "HPCC Fanpage", label: "HPCC HCMUT Official Fanpage" },
      { value: "BDC Fanpage", label: "Big Data Club (BDC) Official Fanpage" },
      { value: "University Portal", label: "University Website / Student Portal" },
      { value: "Friend Referral", label: "Referred by a Friend or Classmate" },
      { value: "Faculty/Advisor", label: "Recommended by a Lecturer or Academic Advisor" },
      { value: "Email Newsletter", label: "University or Club Email Newsletter" },
      { value: "Other", label: "Other" },
    ],
    sourceOtherLabel: "Please specify", sourceOtherPh: "e.g. LinkedIn, a research group, etc.",
    errCvRequired: "Please upload your CV before submitting.",
    errCvUploading: "Please wait for the file upload to complete.",
    errCvFailed: "Upload failed. Please try again.",
    errCvType: "Only PDF files are accepted.", errCvSize: "File exceeds the 5 MB size limit.",
    errResearch: "Please describe your research interests.",
    errMotivation: "Please provide your motivation statement.",
    back: "Back", next: "Continue", submit: "Submit Application", submitting: "Submitting…",
    successTag: "Application Submitted",
    successTitle1: "Thank you,", successTitle2: "for applying!",
    successDesc: "Your application has been successfully submitted to the HCMUT HPC School 2026 selection committee. We will review all submissions and notify you of the outcome via email as soon as possible.",
    followUs: "Stay up to date at:",
    links: [
      { label: "HPCC HCMUT", href: "https://hpcc.hcmut.edu.vn/", color: "text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300" },
      { label: "Facebook HPCC", href: "https://www.facebook.com/hpcc.hcmut", color: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300" },
      { label: "BDC Hub", href: "https://bdc.hpcc.vn/", color: "text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300" },
      { label: "Facebook BDC", href: "https://www.facebook.com/BDCofHCMUT", color: "text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300" },
    ],
    copyright: "© 2026 High-Performance Computing Center - HCMUT. All rights reserved.",
  },
  vi: {
    tagline: "HPCC × CSE × Big Data Club - HCMUT",
    title: "HCMUT HPC School 2026",
    subtitle: "Start Local · Compute at Scale",
    langToggle: "English",
    steps: ["Quyền Riêng Tư", "Thông Tin Cá Nhân", "Hồ Sơ & Nguyện Vọng"],
    privacyTitle: "Cam Kết Quyền Riêng Tư & Bảo Mật Dữ Liệu",
    privacyDesc: "Chúng tôi cam kết bảo vệ thông tin người tham gia một cách có trách nhiệm, minh bạch và an toàn. Mọi thông tin chỉ được thu thập phục vụ mục đích xét tuyển học thuật và tổ chức chương trình.",
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
    privacyCheckDesc: "Bằng việc đánh dấu vào ô này, bạn đồng ý cho phép HPCC & BDC sử dụng thông tin của bạn cho quá trình tuyển sinh HCMUT HPC School 2026.",
    privacyError: "Bạn cần đồng ý với chính sách bảo mật để tiếp tục.",
    step2Title: "Thông Tin Cá Nhân & Học Thuật",
    step2Desc: "Vui lòng cung cấp thông tin chính xác để ban tổ chức tiện liên hệ và xét tuyển.",
    fullName: "Họ và tên", fullNamePh: "Nguyễn Văn A",
    dob: "Ngày sinh",
    studentId: "MSSV", studentIdPh: "231xxxx",
    phone: "Số điện thoại", phonePh: "09xx xxx xxx",
    emailUni: "Email sinh viên (.edu.vn)", emailUniPh: "nguyen.vana@hcmut.edu.vn",
    emailPersonal: "Email cá nhân", emailPersonalPh: "nguyenvana@gmail.com",
    university: "Trường đang theo học", universityPh: "Trường Đại học Bách Khoa – ĐHQG-HCM",
    major: "Khoa / Ngành học", majorPh: "VD: Khoa học Máy tính",
    yearOfStudy: "Năm học", yearPh: "-- Chọn năm --",
    years: ["Năm 1", "Năm 2", "Năm 3", "Năm 4", "Năm 5+", "Đã tốt nghiệp"],
    gpa: "GPA tích lũy", gpaPh: "VD: 3.52 / 4.0",
    errFullName: "Vui lòng nhập họ và tên.", errStudentId: "Vui lòng nhập MSSV.",
    errEmailUni: "Vui lòng nhập email trường.", errEmailFmt: "Email không hợp lệ.",
    errPhone: "Vui lòng nhập số điện thoại.", errUniversity: "Vui lòng nhập tên trường.",
    errMajor: "Vui lòng nhập khoa / ngành.", errYear: "Vui lòng chọn năm học.",
    errGpa: "Vui lòng nhập GPA tích lũy.",
    errGpaScale: "Vui lòng nhập thang điểm.",
    errSourceOther: "Vui lòng ghi rõ nguồn thông tin.",
    step3Title: "Hồ Sơ Kỹ Thuật & Nguyện Vọng",
    step3Desc: "Hãy cho chúng tôi biết về đam mê, nền tảng nghiên cứu và lý do bạn muốn tham gia.",
    cvLabel: "Tải lên CV của bạn (PDF, tối đa 5MB)",
    cvDrag: "Kéo thả file vào đây hoặc", cvClick: "click để chọn",
    cvHint: "Chỉ chấp nhận .PDF · Tối đa 5MB",
    cvUploading: "Đang tải lên Cloudinary…", cvSuccess: "Đã tải lên thành công · Click để thay đổi",
    researchLabel: "Lĩnh vực quan tâm & Định hướng nghiên cứu",
    researchHint: "Mô tả các lĩnh vực bạn đang hoặc muốn theo đuổi (HPC, GPU Computing, Distributed AI, Systems Programming…)",
    researchPh: "VD: HPC, GPU Computing, Distributed AI, Systems Programming…",
    pubLabel: "Bài báo khoa học / Đề tài nghiên cứu nổi bật (nếu có)",
    pubHint: "Liệt kê tên bài báo, hội nghị/tạp chí hoặc đính kèm link. Để trống nếu chưa có.",
    pubPh: "VD:\n• [SOSP'25] Tên bài báo - Conference Name\n• Đề tài NCKH: Tên đề tài - Vai trò: Thành viên\n• https://arxiv.org/abs/...",
    motivationLabel: "Nguyện vọng tham gia",
    motivationHint: "Bạn mong muốn học hỏi và đạt được điều gì sau 3 ngày của HCMUT HPC School 2026?",
    motivationPh: "Chia sẻ nguyện vọng và mục tiêu của bạn…",
    achievementsLabel: "Thành tích học tập / nghiên cứu khác (nếu có)",
    achievementsPh: "Giải thưởng, dự án cá nhân, học bổng, cuộc thi…",
    futurePlansLabel: "Dự định tương lai",
    futurePlansPh: "Định hướng nghề nghiệp, hướng nghiên cứu tiếp theo…",
    sourceTitle: "Bạn Biết Đến Chương Trình Qua Đâu?",
    sourceDesc: "Thông tin này giúp chúng tôi hiểu rõ hơn về kênh tiếp cận của người đăng ký.",
    sourceLabel: "Nguồn thông tin chính", sourcePh: "-- Chọn nguồn thông tin --",
    sourceOptions: [
      { value: "Fanpage HPCC", label: "Fanpage chính thức HPCC HCMUT" },
      { value: "Fanpage BDC", label: "Fanpage chính thức Big Data Club (BDC)" },
      { value: "Cổng thông tin", label: "Website / Cổng thông tin trường" },
      { value: "Bạn bè", label: "Bạn bè / Người quen giới thiệu" },
      { value: "Giảng viên", label: "Giảng viên / Thầy cô giới thiệu" },
      { value: "Email newsletter", label: "Email thông báo của trường / CLB" },
      { value: "Khác", label: "Khác" },
    ],
    sourceOtherLabel: "Vui lòng ghi rõ", sourceOtherPh: "VD: LinkedIn, nhóm nghiên cứu, v.v.",
    errCvRequired: "Vui lòng tải lên CV trước khi nộp đơn.",
    errCvUploading: "Vui lòng chờ file tải lên hoàn tất.",
    errCvFailed: "Tải lên thất bại. Vui lòng thử lại.",
    errCvType: "Chỉ chấp nhận file PDF.", errCvSize: "File vượt quá giới hạn 5MB.",
    errResearch: "Vui lòng điền định hướng nghiên cứu.",
    errMotivation: "Vui lòng chia sẻ nguyện vọng tham gia.",
    back: "Quay lại", next: "Tiếp tục", submit: "Nộp Đơn Đăng Ký", submitting: "Đang gửi đơn…",
    successTag: "Đăng ký thành công",
    successTitle1: "Cảm ơn bạn,", successTitle2: "đã nộp đơn!",
    successDesc: "Hồ sơ của bạn đã được gửi thành công đến ban tuyển sinh HCMUT HPC School 2026. Chúng tôi sẽ xét duyệt và thông báo kết quả qua email sớm nhất có thể.",
    followUs: "Theo dõi thông tin mới nhất tại:",
    links: [
      { label: "HPCC HCMUT", href: "https://hpcc.hcmut.edu.vn/", color: "text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300" },
      { label: "Facebook HPCC", href: "https://www.facebook.com/hpcc.hcmut", color: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300" },
      { label: "BDC Hub", href: "https://bdc.hpcc.vn/", color: "text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300" },
      { label: "Facebook BDC", href: "https://www.facebook.com/BDCofHCMUT", color: "text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300" },
    ],
    copyright: "© 2026 Trung tâm Tính toán Hiệu năng Cao - HCMUT. All rights reserved.",
  },
} as const;

export type Translation = typeof T["en"] | typeof T["vi"];

export const ALREADY_MSG = {
  en: {
    tag: "Already Submitted",
    title1: "You've already", title2: "applied!",
    desc: "Our records show that an application has already been submitted from this device. If you believe this is a mistake, please contact the organizing committee directly.",
    contact: "Get in touch:",
    clearBtn: "Clear record and re-submit (use with caution)",
    clearConfirm: "This will clear your submission record from this device. Continue?",
  },
  vi: {
    tag: "Đã Nộp Đơn",
    title1: "Bạn đã", title2: "nộp đơn rồi!",
    desc: "Hệ thống ghi nhận rằng một hồ sơ đã được nộp từ thiết bị này. Nếu đây là nhầm lẫn, vui lòng liên hệ trực tiếp với ban tổ chức.",
    contact: "Liên hệ ban tổ chức:",
    clearBtn: "Xóa lịch sử và nộp lại (cẩn thận)",
    clearConfirm: "Thao tác này sẽ xóa lịch sử nộp đơn trên thiết bị. Tiếp tục?",
  },
} as const;
