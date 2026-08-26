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
    taglineVi: "Kỹ thuật & Công nghệ · Phát triển Hệ thống, AI & Dữ liệu lớn",
    taglineEn: "Engineering & Tech · Systems, AI & Big Data Development",
    descriptionVi:
      "Nơi bạn trực tiếp làm chủ mã nguồn các sản phẩm thực tế của CLB, thực hành trên hạ tầng Server/GPU riêng và tiếp cận với công nghệ Big Data / AI mới nhất.",
    descriptionEn:
      "Build real-world engineering products, gain hands-on access to BDC's private GPU/Server infrastructure, and master modern Big Data & AI stacks.",
    highlightsVi: [
      "Thực chiến với Server GPU & Cluster thực tế",
      "Xây dựng RAG, AI Agent, Data Pipeline & Web App",
      "Mentorship 1:1 từ các đàn anh nhiều kinh nghiệm",
    ],
    highlightsEn: [
      "Hands-on practice with private GPU Servers & Clusters",
      "Build RAG, AI Agents, Data Pipelines & Web Apps",
      "1:1 Mentorship from senior engineering alumni",
    ],
    skillsVi: ["Python, C++, Go, TypeScript", "PyTorch, RAG, LLM, Vector DB", "Docker, Kubernetes, Kafka, MinIO", "Next.js, FastAPI, Spring Boot"],
    skillsEn: ["Python, C++, Go, TypeScript", "PyTorch, RAG, LLM, Vector DB", "Docker, Kubernetes, Kafka, MinIO", "Next.js, FastAPI, Spring Boot"],
  },
  {
    id: "community" as DepartmentId,
    nameVi: "Community (Truyền thông & Sự kiện)",
    nameEn: "Community (Media & Events)",
    taglineVi: "Kết nối & Sáng tạo · Xây dựng Thương hiệu & Vận hành Sự kiện",
    taglineEn: "Connection & Creation · Brand Building & Event Operations",
    descriptionVi:
      "Nơi biến các ý tưởng công nghệ thành hình ảnh, bài viết truyền cảm hứng và điều phối các Hackathon, Workshop công nghệ quy mô lớn tại HCMUT.",
    descriptionEn:
      "Transform tech ideas into inspiring visual stories and operate large-scale Hackathons, Tech Workshops & Community events at HCMUT.",
    highlightsVi: [
      "Quản lý Fanpage & Kênh Truyền thông chính thức của BDC",
      "Thiết kế Graphic Design, Video & Sáng tạo Content",
      "Đứng sau thành công của các sự kiện & Hackathon lớn",
    ],
    highlightsEn: [
      "Manage BDC's official social media channels & outreach",
      "Graphic Design, Video Production & Content Creation",
      "Operate major Tech Workshops, Seminars & Hackathons",
    ],
    skillsVi: ["Sáng tạo nội dung & Copywriting", "Thiết kế Banner, Post (Figma/Photoshop)", "Quay dựng Video & Media", "Quản lý sự kiện & Đối ngoại"],
    skillsEn: ["Content Creation & Copywriting", "UI/Graphic Design (Figma/Photoshop)", "Video Production & Media", "Event Management & Outreach"],
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
    step1Desc: "Vui lòng điền chính xác thông tin để Ban Nhân sự BDC thuận tiện liên hệ và gửi kết quả.",
    emailConfirmation: "Email nhận thông báo & xác nhận đơn *",
    emailConfirmationPh: "Ví dụ: bdc@hcmut.edu.vn hoặc email cá nhân",
    emailConfirmationHint: "Kết quả vòng hồ sơ và lịch phỏng vấn sẽ được gửi trực tiếp tới email này.",
    fullName: "Họ và tên *",
    fullNamePh: "Ví dụ: Nguyễn Văn Ánh",
    phone: "Số điện thoại liên hệ *",
    phonePh: "Ví dụ: 0987654321",
    emailPersonal: "Email cá nhân *",
    emailPersonalPh: "Ví dụ: nguyenvana@gmail.com",
    emailSchool: "Email sinh viên / Trường học *",
    emailSchoolPh: "Ví dụ: anh.nguyen26@hcmut.edu.vn",
    facebookLink: "Link Facebook cá nhân (thường dùng) *",
    facebookLinkPh: "Ví dụ: https://facebook.com/nguyenvana",
    university: "Trường Đại học đang theo học *",
    universityPh: "Ví dụ: Trường Đại học Bách Khoa - ĐHQG TP.HCM (HCMUT)",
    faculty: "Khoa / Ngành học *",
    facultyPh: "Ví dụ: Khoa Khoa học & Kỹ thuật Máy tính (CSE)",
    studentId: "Mã số sinh viên (MSSV)",
    studentIdPh: "Ví dụ: 2410123",
    academicStatus: "Năm học hiện tại *",
    academicStatusOtherPh: "Vui lòng ghi rõ trình độ hoặc trạng thái hiện tại...",

    // Step 2
    step2Header: "Hồ sơ Học tập & Minh chứng",
    step2Desc: "Cung cấp kết quả học tập và minh chứng để BDC đánh giá đúng năng lực của bạn.",
    freshmanNoticeTitle: "Dành cho Tân Sinh viên (Khóa 2026)",
    freshmanNoticeDesc: "Hãy cập nhật điểm thi Tốt nghiệp THPT và điểm Kỳ thi Đánh giá Năng lực (nếu có).",
    seniorNoticeTitle: "Dành cho Sinh viên từ Năm 1 trở đi",
    seniorNoticeDesc: "Vui lòng cập nhật điểm GPA tích lũy và điểm học kỳ gần nhất của bạn.",
    gpaCumulative: "GPA tích lũy *",
    gpaCumulativePh: "Ví dụ: 3.65 / 4.0",
    gpaLatest: "GPA học kỳ gần nhất *",
    gpaLatestPh: "Ví dụ: 3.78 / 4.0",
    thptDgnlScores: "Điểm thi THPT và / hoặc ĐGNL *",
    thptDgnlScoresPh: "Ví dụ: THPT: 28.5 (Toán 9.6, Lý 9.25, Anh 9.65) | ĐGNL: 950/1200",
    thptScore: "Điểm thi Tốt nghiệp THPT *",
    thptScorePh: "Ví dụ: Toán 9.0, Lý 8.5, Hóa 9.0 (hoặc Tổng điểm: 26.5)",
    hasDgnl: "Bạn có tham gia Kỳ thi ĐGNL ĐHQG-HCM không? *",
    hasDgnlPh: "Chọn câu trả lời...",
    dgnlScore: "Điểm thi ĐGNL ĐHQG-HCM *",
    dgnlScorePh: "Ví dụ: 920 / 1200",
    errDgnlRequired: "Vui lòng nhập điểm thi ĐGNL ĐHQG-HCM của bạn.",
    achievementsExtracurricular: "Thành tích học tập & Hoạt động ngoại khóa (nếu chưa có ghi 'Chưa có')",
    achievementsExtracurricularPh: "Ví dụ: Giải Nhất HSG môn Tin học, Trưởng ban Truyền thông CLB cấp 3, Học bổng...",
    englishCert: "Chứng chỉ Tiếng Anh (nếu chưa có ghi 'Chưa có') *",
    englishCertPh: "Ví dụ: IELTS 7.5 / TOEIC 850 / VSTEP B2 hoặc ghi 'Chưa có'",
    englishCertType: "Loại chứng chỉ Tiếng Anh *",
    englishCertTypePh: "Chọn loại chứng chỉ...",
    englishCertScore: "Điểm số chứng chỉ *",
    englishCertScorePh: "Ví dụ: 7.5 (hoặc 850, B2...)",
    cvUploadLabel: "CV ứng tuyển (Định dạng PDF, tối đa 10MB) *",
    cvUploadHint: "Bản CV chi tiết giúp Ban Nhân sự hiểu rõ hành trình và kỹ năng của bạn.",
    evidenceUploadLabel: "Minh chứng / Bảng điểm / Giấy khen đi kèm (Tùy chọn, tối đa 5 file)",
    evidenceUploadHint: "Tải lên ảnh chứng chỉ Tiếng Anh, Bảng điểm học kỳ, Giấy khen (PNG, JPG, PDF)...",

    // Step 3
    step3Header: "Lựa chọn Ban & Kỳ vọng",
    step3Desc: "Lựa chọn Ban phù hợp nhất với định hướng và chia sẻ kỳ vọng của bạn khi gia nhập BDC.",
    deptSelectLabel: "Ban ứng tuyển nguyện vọng 1 *",
    deptSelectHint: "Đọc kỹ đặc quyền, cơ hội và yêu cầu chuyên môn của từng Ban trước khi lựa chọn.",
    motivationLabel: "Lý do & Động lực ứng tuyển vào Big Data Club *",
    motivationHint: "Chia sẻ ngắn gọn mục tiêu cá nhân, kỹ năng muốn rèn luyện hoặc đóng góp của bạn cho CLB...",
    motivationPh: "Ví dụ: Em muốn rèn luyện tư duy lập trình hệ thống, tham gia phát triển dự án AI thực tế và học hỏi kinh nghiệm từ các đàn anh tại BDC...",
    sendCopyLabel: "Gửi một bản sao hồ sơ đã nộp về Email của tôi",

    // Step 4
    step4Header: "Xác nhận & Gửi đơn",
    step4Desc: "Rà soát lại toàn bộ thông tin đã điền trước khi hoàn tất nộp đơn đăng ký.",
    reviewPersonal: "Thông tin cá nhân & Liên hệ",
    reviewAcademic: "Hồ sơ Học tập & Minh chứng",
    reviewDepartment: "Nguyện vọng & Động lực",
    agreePrivacyLabel: "Tôi cam kết toàn bộ thông tin đã khai báo là hoàn toàn chính xác và trung thực.",
    agreePrivacyErr: "Vui lòng tích chọn xác nhận cam kết thông tin trước khi gửi đơn.",

    // Validation messages
    errRequired: "Vui lòng điền thông tin này.",
    errEmail: "Vui lòng nhập định dạng email hợp lệ (ví dụ: name@domain.com).",
    errPhone: "Vui lòng nhập số điện thoại hợp lệ (8 - 15 chữ số).",
    errFacebook: "Vui lòng nhập đúng liên kết trang cá nhân Facebook (chứa facebook.com).",
    errCvRequired: "Vui lòng tải lên file CV ứng tuyển của bạn.",
    errDeptRequired: "Vui lòng chọn Ban bạn muốn ứng tuyển.",

    // Success screen
    successTitle: "Nộp Đơn Ứng Tuyển Thành Công!",
    successSubtitle: "Cảm ơn bạn đã nộp đơn gia nhập Big Data Club - Recruitment 2026.",
    successMsg: "Hồ sơ của bạn đã được lưu trữ an toàn trên hệ thống.",
    successEmailNote: "Email xác nhận đơn đăng ký đã được gửi tới:",
    successNextStepsTitle: "Quy trình xử lý tiếp theo:",
    successNextSteps: [
      "Ban Nhân sự BDC sẽ đánh giá hồ sơ của bạn trong vòng 3 - 5 ngày làm việc.",
      "Thông báo kết quả Vòng Hồ sơ và lịch Phỏng vấn sẽ được gửi qua Email & SĐT/Zalo.",
      "Theo dõi các kênh truyền thông chính thức của BDC để không bỏ lỡ thông báo mới.",
    ],
    btnReturnHome: "Trở về Trang chủ BDC",
    alreadySubmittedTitle: "Hồ Sơ Đã Được Ghi Nhận!",
    alreadySubmittedDesc: "Hệ thống xác nhận bạn đã hoàn thành nộp đơn ứng tuyển Big Data Club Recruitment 2026.",
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
