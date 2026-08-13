export type Lang = "vi" | "en";

export type AcademicStatus = "freshman" | "year1" | "year2" | "year3" | "other";

export type DepartmentId = "rd" | "community";

export interface CloudinaryFile {
  url: string;
  filename: string;
  publicId?: string;
  size?: number;
}

export interface FormData {
  // Step 1: Personal & Contact Info
  emailConfirmation: string;
  fullName: string;
  phone: string;
  emailPersonal: string;
  emailSchool: string;
  facebookLink: string;
  university: string;
  faculty: string;
  studentId: string;
  academicStatus: AcademicStatus;
  academicStatusOther: string;

  // Step 2: Academic & Achievements
  gpaCumulative: string;
  gpaLatest: string;
  thptDgnlScores: string;
  thptScore?: string;
  hasDgnl?: string;
  dgnlScore?: string;
  achievementsExtracurricular: string;
  englishCert: string;
  englishCertType?: string;
  englishCertScore?: string;
  cvFile: CloudinaryFile | null;
  evidenceFiles: CloudinaryFile[];

  // Step 3: Department & Expectations
  department: DepartmentId | "";
  motivation: string;
  sendCopy: boolean;

  // Policy agreement
  agreePrivacy: boolean;
}

export interface Errors {
  [key: string]: string;
}

export const ACADEMIC_STATUS_OPTIONS: { id: AcademicStatus; labelVi: string; labelEn: string }[] = [
  { id: "freshman", labelVi: "Tân sinh viên (K26 / Khóa mới)", labelEn: "Freshman (First Year / Entry 2026)" },
  { id: "year1", labelVi: "Vừa hoàn thành năm 1", labelEn: "Completed Year 1" },
  { id: "year2", labelVi: "Vừa hoàn thành năm 2", labelEn: "Completed Year 2" },
  { id: "year3", labelVi: "Vừa hoàn thành năm 3", labelEn: "Completed Year 3" },
  { id: "other", labelVi: "Mục khác", labelEn: "Other" },
];

export const DEPARTMENT_OPTIONS = [
  {
    id: "rd" as DepartmentId,
    nameVi: "Research & Development (R&D)",
    nameEn: "Research & Development (R&D)",
    badgeVi: "Kỹ thuật & Công nghệ",
    badgeEn: "Engineering & Tech",
    taglineVi: "Nghiên cứu, phát triển sản phẩm AI, Data Engineering, Web/App & Cloud Compute",
    taglineEn: "R&D in AI Systems, Data Engineering, Web/App Development & Cloud Infrastructure",
    descriptionVi:
      "Dành cho các bạn đam mê Lập trình, Khoa học dữ liệu, Trí tuệ nhân tạo (AI/ML), Hệ thống phân tán, Web Fullstack hoặc nghiên cứu học thuật. Được tham gia dự án thực tế, thực hành trên hạ tầng Server/GPU của CLB.",
    descriptionEn:
      "For students passionate about Software Engineering, Data Science, AI/ML models, Distributed Systems, Fullstack Web, or Academic Research. Hands-on experience with production code & GPU infrastructure.",
    skillsVi: ["Python, C++, Go, TypeScript", "PyTorch, RAG, LLM, Vector DB", "Docker, Kubernetes, Kafka, MinIO", "Next.js, FastAPI, Spring Boot"],
    skillsEn: ["Python, C++, Go, TypeScript", "PyTorch, RAG, LLM, Vector DB", "Docker, Kubernetes, Kafka, MinIO", "Next.js, FastAPI, Spring Boot"],
    color: "from-blue-500/20 via-cyan-500/10 to-transparent border-blue-500/40 text-blue-400",
    glowColor: "group-hover:border-blue-500/80 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]",
  },
  {
    id: "community" as DepartmentId,
    nameVi: "Community (Truyền thông & Sự kiện)",
    nameEn: "Community (Media & Events)",
    badgeVi: "Kết nối & Sáng tạo",
    badgeEn: "Media & Outreach",
    taglineVi: "Truyền thông, Branding, Xây dựng cộng đồng, Tổ chức sự kiện & Đối ngoại",
    taglineEn: "Media Branding, Community Building, Event Operations & Partnerships",
    descriptionVi:
      "Dành cho các bạn muốn phát triển kỹ năng MKT/Branding, Sáng tạo nội dung, Thiết kế đồ họa/Video, Quản trị Fanpage/Cộng đồng, hoặc Lên kế hoạch & Điều phối các workshop/hackathon công nghệ lớn.",
    descriptionEn:
      "For students eager to practice Marketing/Branding, Content Creation, Graphic Design/Video Editing, Community Management, or Operations for tech workshops & hackathons.",
    skillsVi: ["Sáng tạo nội dung & Copywriting", "Thiết kế Banner, Post (Figma/Photoshop)", "Quay dựng Video & Media", "Quản lý sự kiện & Đối ngoại"],
    skillsEn: ["Content Creation & Copywriting", "UI/Graphic Design (Figma/Photoshop)", "Video Production & Media", "Event Management & Outreach"],
    color: "from-purple-500/20 via-pink-500/10 to-transparent border-purple-500/40 text-purple-400",
    glowColor: "group-hover:border-purple-500/80 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]",
  },
];

export const T = {
  vi: {
    heroBadge: "TUYỂN THÀNH VIÊN 2026",
    heroTitle: "BIG DATA CLUB RECRUITMENT 2026",
    heroSubtitle: "Chào Đón Thế Hệ Mới · Empowering Tomorrow's Tech Leaders",
    heroDesc:
      "Tham gia Big Data Club (BDC) để cùng học hỏi, thực chiến các dự án dữ liệu lớn, AI, công nghệ tiên tiến và phát triển bản thân trong môi trường trẻ trung, năng động tại HCMUT.",
    langToggle: "English",

    // Steps
    steps: [
      { step: 1, title: "Thông tin cá nhân", sub: "Liên hệ & Trường học" },
      { step: 2, title: "Học tập & CV", sub: "Thành tích & Minh chứng" },
      { step: 3, title: "Ban & Kỳ vọng", sub: "Nguyện vọng & Động lực" },
      { step: 4, title: "Xác nhận & Gửi", sub: "Rà soát thông tin" },
    ],

    // Buttons
    btnNext: "Tiếp tục",
    btnPrev: "Quay lại",
    btnSubmit: "Gửi đơn ứng tuyển",
    btnSubmitting: "Đang xử lý gửi...",

    // Step 1
    step1Header: "Thông tin cá nhân & Liên hệ",
    step1Desc: "Vui lòng nhập chính xác các thông tin để Ban nhân sự BDC dễ dàng liên hệ với bạn.",
    emailConfirmation: "Email nhận thông báo / xác nhận đơn *",
    emailConfirmationPh: "vd: bdc@hcmut.edu.vn hoặc email cá nhân",
    emailConfirmationHint: "Ban nhân sự sẽ gửi kết quả vòng hồ sơ & lịch phỏng vấn qua email này.",
    fullName: "Họ và tên *",
    fullNamePh: "vd: Nguyễn Văn Ánh",
    phone: "Số điện thoại *",
    phonePh: "vd: 0987654321",
    emailPersonal: "Email cá nhân *",
    emailPersonalPh: "vd: nguyenvana@gmail.com",
    emailSchool: "Email trường học *",
    emailSchoolPh: "vd: anh.nguyen26@hcmut.edu.vn",
    facebookLink: "Link Facebook cá nhân sử dụng nhiều nhất *",
    facebookLinkPh: "vd: https://facebook.com/nguyenvana",
    university: "Trường đại học bạn đang học *",
    universityPh: "vd: Trường Đại học Bách Khoa - ĐHQG TP.HCM (HCMUT)",
    faculty: "Khoa / Ngành học *",
    facultyPh: "vd: Khoa Khoa học & Kỹ thuật Máy tính (CSE)",
    studentId: "Mã số sinh viên (MSSV)",
    studentIdPh: "vd: 2410123",
    academicStatus: "Bạn hiện đang là *",
    academicStatusOtherPh: "Vui lòng ghi rõ trình độ / trạng thái hiện tại...",

    // Step 2
    step2Header: "Hồ sơ Học tập & Minh chứng",
    step2Desc: "Hãy chia sẻ về thành tích, chứng chỉ hoặc kết quả học tập để BDC hiểu rõ hơn về bạn.",
    freshmanNoticeTitle: "Dành riêng cho Tân Sinh Viên (K26 / Khóa mới)",
    freshmanNoticeDesc: "Chào mừng bạn đến với giảng đường đại học! Hãy điền thông tin điểm thi THPT QG / ĐGNL và các thành tích cấp 3 của bạn.",
    seniorNoticeTitle: "Dành cho Sinh Viên Năm 1, 2, 3...",
    seniorNoticeDesc: "Vui lòng cập nhật điểm GPA tích lũy và học kỳ gần nhất của bạn.",
    gpaCumulative: "GPA tích lũy (Hệ 4 hoặc 10) *",
    gpaCumulativePh: "vd: 3.65 / 4.0",
    gpaLatest: "GPA kỳ học gần nhất *",
    gpaLatestPh: "vd: 3.78 / 4.0",
    thptDgnlScores: "Điểm thi THPT QG và / hoặc điểm thi ĐGNL *",
    thptDgnlScoresPh: "vd: THPT QG: 28.5 (Toán 9.6, Lý 9.25, Anh 9.65) | ĐGNL: 950/1200",
    thptScore: "Điểm thi Tốt nghiệp THPT *",
    thptScorePh: "vd: Toán 9.0, Lý 8.5, Hóa 9.0 hoặc Tổng điểm 26.5",
    hasDgnl: "Bạn có tham gia kỳ thi ĐGNL ĐHQG không? *",
    hasDgnlPh: "Chọn câu trả lời...",
    dgnlScore: "Điểm thi ĐGNL ĐHQG *",
    dgnlScorePh: "vd: 920/1200",
    errDgnlRequired: "Vui lòng nhập điểm thi ĐGNL ĐHQG.",
    achievementsExtracurricular: "Thành tích học tập & hoạt động ngoại khóa (nếu chưa có ghi 'Chưa có')",
    achievementsExtracurricularPh: "vd: Giải Nhất HSG Tỉnh môn Tin học, Trưởng ban Truyền thông CLB Cấp 3, Học bổng Học tập...",
    englishCert: "Chứng chỉ Tiếng Anh (nếu chưa có ghi 'Chưa có') *",
    englishCertPh: "vd: IELTS 7.5 / TOEIC 850 / VSTEP B2 / Khác (ghi rõ nếu chưa có)",
    englishCertType: "Loại chứng chỉ Tiếng Anh *",
    englishCertTypePh: "Chọn loại chứng chỉ...",
    englishCertScore: "Điểm số chứng chỉ *",
    englishCertScorePh: "vd: 7.5 (hoặc 850, B2...)",
    cvUploadLabel: "CV ứng tuyển của bạn (Định dạng PDF, tối đa 10MB) *",
    cvUploadHint: "Một bản CV ấn tượng sẽ giúp bạn ghi điểm rất lớn với Ban tuyển dụng!",
    evidenceUploadLabel: "Minh chứng / Chứng chỉ / Bảng điểm đi kèm (Tùy chọn, tối đa 5 file)",
    evidenceUploadHint: "Có thể tải lên ảnh chứng chỉ Tiếng Anh, Bảng điểm, Giấy khen (PNG, JPG, PDF)...",

    // Step 3
    step3Header: "Lựa chọn Ban & Kỳ vọng",
    step3Desc: "Hãy chọn Ban phù hợp nhất với định hướng cá nhân và cho BDC biết kỳ vọng của bạn.",
    deptSelectLabel: "Bạn muốn ứng tuyển vào Ban nào? *",
    deptSelectHint: "Bạn có thể tìm hiểu thêm thông tin nhiệm vụ & kỹ năng của từng Ban bên dưới.",
    motivationLabel: "Bạn kỳ vọng gì khi tham gia Big Data Club? *",
    motivationHint: "Chia sẻ lý do bạn ứng tuyển, mong muốn học hỏi, môi trường làm việc hoặc mục tiêu cá nhân...",
    motivationPh: "Ví dụ: Em muốn rèn luyện kỹ năng làm việc nhóm, thực chiến dự án Big Data/AI thực tế, kết nối với các anh chị đi trước và học hỏi tư duy kỹ thuật...",
    sendCopyLabel: "Gửi email xác nhận hồ sơ đến địa chỉ email đăng ký",

    // Step 4
    step4Header: "Rà soát thông tin & Xác nhận",
    step4Desc: "Kiểm tra kỹ thông tin đã điền trước khi gửi đơn ứng tuyển chính thức.",
    reviewPersonal: "Thông tin cá nhân",
    reviewAcademic: "Hồ sơ học tập",
    reviewDepartment: "Nguyện vọng & Kỳ vọng",
    agreePrivacyLabel: "Tôi cam kết các thông tin khai báo trên là hoàn toàn chính xác và trung thực.",
    agreePrivacyErr: "Bạn vui lòng xác nhận cam kết trước khi gửi đơn.",

    // Validation messages
    errRequired: "Trường này là bắt buộc.",
    errEmail: "Vui lòng nhập email hợp lệ.",
    errPhone: "Vui lòng nhập số điện thoại hợp lệ.",
    errFacebook: "Vui lòng nhập đúng liên kết tài khoản Facebook.",
    errCvRequired: "Vui lòng tải lên CV ứng tuyển của bạn (Cloudinary).",
    errDeptRequired: "Vui lòng lựa chọn Ban bạn muốn ứng tuyển.",

    // Success screen
    successTitle: "Nộp Đơn Ứng Tuyển Thành Công!",
    successSubtitle: "Cảm ơn bạn đã quan tâm và nộp đơn gia nhập Big Data Club Recruitment 2026.",
    successMsg: "Thông tin và file đính kèm của bạn đã được ghi nhận trên hệ thống BDC & Cloudinary.",
    successEmailNote: "Email xác nhận đang được gửi tới:",
    successNextStepsTitle: "Các bước tiếp theo:",
    successNextSteps: [
      "Ban Nhân sự BDC sẽ tiến hành chấm hồ sơ của bạn trong vòng 3-5 ngày làm việc.",
      "Lịch phỏng vấn chi tiết sẽ được gửi qua Email & Zalo/SMS liên hệ.",
      "Theo dõi Fanpage Big Data Club để cập nhật các tin tức tuyển thành viên mới nhất.",
    ],
    btnReturnHome: "Quay về Trang chủ BDC",
    alreadySubmittedTitle: "Bạn Đã Nộp Đơn Ứng Tuyển!",
    alreadySubmittedDesc: "Hệ thống ghi nhận bạn đã hoàn thành gửi biểu mẫu tuyển thành viên Big Data Club 2026.",
  },
  en: {
    heroBadge: "RECRUITMENT 2026",
    heroTitle: "BIG DATA CLUB RECRUITMENT 2026",
    heroSubtitle: "Welcome New Generation · Empowering Tomorrow's Tech Leaders",
    heroDesc:
      "Join Big Data Club (BDC) to build real-world AI & Big Data projects, master cloud technologies, and accelerate your growth in a dynamic tech community at HCMUT.",
    langToggle: "Tiếng Việt",

    // Steps
    steps: [
      { step: 1, title: "Personal Info", sub: "Contact & University" },
      { step: 2, title: "Academic & CV", sub: "Profile & Documents" },
      { step: 3, title: "Department", sub: "Role & Motivation" },
      { step: 4, title: "Review & Submit", sub: "Final Check" },
    ],

    // Buttons
    btnNext: "Continue",
    btnPrev: "Back",
    btnSubmit: "Submit Application",
    btnSubmitting: "Submitting...",

    // Step 1
    step1Header: "Personal & Contact Information",
    step1Desc: "Please fill out accurate contact details so the BDC HR team can reach out to you.",
    emailConfirmation: "Confirmation Email *",
    emailConfirmationPh: "e.g. bdc@hcmut.edu.vn or personal email",
    emailConfirmationHint: "Screening results and interview invites will be sent to this email.",
    fullName: "Full Name *",
    fullNamePh: "e.g. Alex Nguyen",
    phone: "Phone Number *",
    phonePh: "e.g. +84 987 654 321",
    emailPersonal: "Personal Email *",
    emailPersonalPh: "e.g. alex.nguyen@gmail.com",
    emailSchool: "University Email *",
    emailSchoolPh: "e.g. alex.nguyen26@hcmut.edu.vn",
    facebookLink: "Facebook Profile Link *",
    facebookLinkPh: "e.g. https://facebook.com/alexnguyen",
    university: "University *",
    universityPh: "e.g. Ho Chi Minh City University of Technology (HCMUT)",
    faculty: "Faculty / Major *",
    facultyPh: "e.g. Computer Science & Engineering (CSE)",
    studentId: "Student ID (MSSV)",
    studentIdPh: "e.g. 2410123",
    academicStatus: "Academic Status *",
    academicStatusOtherPh: "Specify your current academic status...",

    // Step 2
    step2Header: "Academic Profile & Credentials",
    step2Desc: "Share your academic achievements, language certificates, and upload your CV.",
    freshmanNoticeTitle: "For Freshmen (Entry 2026)",
    freshmanNoticeDesc: "Welcome to HCMUT! Please fill in your High School Exam / Competency Test scores.",
    seniorNoticeTitle: "For 1st, 2nd & 3rd Year Students",
    seniorNoticeDesc: "Please update your cumulative GPA and latest semester GPA.",
    gpaCumulative: "Cumulative GPA (4.0 or 10.0 scale) *",
    gpaCumulativePh: "e.g. 3.65 / 4.0",
    gpaLatest: "Latest Semester GPA *",
    gpaLatestPh: "e.g. 3.78 / 4.0",
    thptDgnlScores: "High School Exam / Competency Test Scores *",
    thptDgnlScoresPh: "e.g. National Exam: 28.5 | Competency Test: 950/1200",
    thptScore: "High School Graduation Exam Score *",
    thptScorePh: "e.g. Math 9.0, Phys 8.5, Chem 9.0 or Total: 26.5",
    hasDgnl: "Did you take the VNU Competency Test (ĐGNL)? *",
    hasDgnlPh: "Select answer...",
    dgnlScore: "Competency Test Score *",
    dgnlScorePh: "e.g. 920/1200",
    errDgnlRequired: "Please enter your Competency Test (ĐGNL) score.",
    achievementsExtracurricular: "Achievements & Extracurricular Activities (enter 'None' if applicable)",
    achievementsExtracurricularPh: "e.g. Provincial Informatics Award, High School Club Lead, Academic Scholarship...",
    englishCert: "English Certificates (enter 'None' if applicable) *",
    englishCertPh: "e.g. IELTS 7.5 / TOEIC 850 / VSTEP B2 / None",
    englishCertType: "English Certificate Type *",
    englishCertTypePh: "Select certificate type...",
    englishCertScore: "Certificate Score *",
    englishCertScorePh: "e.g. 7.5 (or 850, B2...)",
    cvUploadLabel: "Upload Your CV (PDF, max 10MB) *",
    cvUploadHint: "A strong CV will make your application stand out!",
    evidenceUploadLabel: "Supporting Documents / Transcripts (Optional, max 5 files)",
    evidenceUploadHint: "Upload certificates, grade transcripts, or awards (PNG, JPG, PDF)...",

    // Step 3
    step3Header: "Department Selection & Aspirations",
    step3Desc: "Select the department that best aligns with your goals and tell us your expectations.",
    deptSelectLabel: "Which department do you wish to join? *",
    deptSelectHint: "Explore role descriptions and required skills for each department below.",
    motivationLabel: "What do you expect when joining Big Data Club? *",
    motivationHint: "Share your reasons for applying, learning goals, and expectations...",
    motivationPh: "Share your goals, motivation, and what skills you wish to learn...",
    sendCopyLabel: "Send an application confirmation email to my registered email",

    // Step 4
    step4Header: "Review & Confirmation",
    step4Desc: "Review your submitted information before final submission.",
    reviewPersonal: "Personal Details",
    reviewAcademic: "Academic Profile",
    reviewDepartment: "Department & Aspirations",
    agreePrivacyLabel: "I certify that all information provided is true and accurate.",
    agreePrivacyErr: "Please confirm your agreement before submitting.",

    // Validation messages
    errRequired: "This field is required.",
    errEmail: "Please enter a valid email address.",
    errPhone: "Please enter a valid phone number.",
    errFacebook: "Please enter a valid Facebook profile URL.",
    errCvRequired: "Please upload your CV (Cloudinary file upload required).",
    errDeptRequired: "Please select a department to apply for.",

    // Success screen
    successTitle: "Application Submitted Successfully!",
    successSubtitle: "Thank you for applying to Big Data Club Recruitment 2026.",
    successMsg: "Your application and uploaded documents have been securely processed on BDC & Cloudinary.",
    successEmailNote: "A confirmation email is being sent to:",
    successNextStepsTitle: "Next Steps:",
    successNextSteps: [
      "The BDC HR team will review your application within 3-5 business days.",
      "Interview invitations will be sent via Email & Phone/SMS.",
      "Follow our Official Fanpage for real-time recruitment updates.",
    ],
    btnReturnHome: "Return to BDC Homepage",
    alreadySubmittedTitle: "Application Already Submitted!",
    alreadySubmittedDesc: "Our system indicates you have already completed and submitted your BDC 2026 application.",
  },
};
