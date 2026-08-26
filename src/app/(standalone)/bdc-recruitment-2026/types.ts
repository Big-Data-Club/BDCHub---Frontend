export type Lang = "vi" | "en";

export type AcademicStatus = "freshman" | "year1" | "year2" | "year3" | "other";

export type DepartmentId = "rd" | "community";

export type EntranceMethod =
  | "thpt"
  | "dgnl_hcm"
  | "dgnl_hn"
  | "tsa"
  | "hocba"
  | "direct_international"
  | "other";

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
  emailSchool?: string;
  facebookLink: string;
  university: string;
  faculty: string;
  studentId: string;
  academicStatus: AcademicStatus;
  academicStatusOther: string;

  // Step 2: Academic & Achievements
  entranceMethod?: EntranceMethod;
  entranceScoreDetail?: string;
  gpaCumulative: string;
  gpaLatest: string;
  gpaScale?: string;
  thptDgnlScores: string;
  thptScore?: string;
  hasDgnl?: string;
  dgnlScore?: string;
  achievementsExtracurricular: string;
  englishCert: string;
  englishCertType?: string;
  englishCertScore?: string;
  cvFile: CloudinaryFile | null;
  cvBioText?: string;
  evidenceFiles: CloudinaryFile[];

  // Step 3: Department & Expectations
  department: DepartmentId | "";
  allowDepartmentAdjustment?: boolean;
  weeklyTimeCommitment?: string;
  motivation: string;
  sendCopy: boolean;

  // Policy agreement
  agreePrivacy: boolean;
}

export interface Errors {
  [key: string]: string;
}

export const ACADEMIC_STATUS_OPTIONS: { id: AcademicStatus; labelVi: string; labelEn: string }[] = [
  { id: "freshman", labelVi: "Tân sinh viên (Khóa 2026)", labelEn: "Freshman (Entry 2026)" },
  { id: "year1", labelVi: "Sinh viên Năm 1 (Vừa hoàn thành năm 1)", labelEn: "1st Year Student (Completed Year 1)" },
  { id: "year2", labelVi: "Sinh viên Năm 2 (Vừa hoàn thành năm 2)", labelEn: "2nd Year Student (Completed Year 2)" },
  { id: "year3", labelVi: "Sinh viên Năm 3 trở đi", labelEn: "3rd Year+ Student" },
  { id: "other", labelVi: "Khác", labelEn: "Other" },
];

export const ENTRANCE_METHOD_OPTIONS = [
  { id: "thpt" as EntranceMethod, labelVi: "Điểm thi Tốt nghiệp THPT QG", labelEn: "National High School Exam Scores" },
  { id: "dgnl_hcm" as EntranceMethod, labelVi: "Kỳ thi ĐGNL ĐHQG TP.HCM", labelEn: "VNU-HCM Competency Test (ĐGNL)" },
  { id: "dgnl_hn" as EntranceMethod, labelVi: "Kỳ thi ĐGNL ĐHQG Hà Nội (HSA)", labelEn: "VNU-HN Competency Test (HSA)" },
  { id: "tsa" as EntranceMethod, labelVi: "Đánh giá tư duy Bách Khoa Hà Nội (TSA)", labelEn: "HUST Thinking Skills Assessment (TSA)" },
  { id: "hocba" as EntranceMethod, labelVi: "Xét tuyển Học bạ THPT", labelEn: "High School Academic Transcript Review" },
  { id: "direct_international" as EntranceMethod, labelVi: "Xét tuyển thẳng / Chứng chỉ Quốc tế (SAT/IB/IELTS...)", labelEn: "Direct Admission / International Certs (SAT/IB/IELTS...)" },
  { id: "other" as EntranceMethod, labelVi: "Phương thức tuyển sinh khác", labelEn: "Other Entrance Method" },
];

export const GPA_SCALE_OPTIONS = [
  { id: "4.0", labelVi: "Thang điểm 4.0", labelEn: "4.0 Scale" },
  { id: "10.0", labelVi: "Thang điểm 10.0", labelEn: "10.0 Scale" },
  { id: "other", labelVi: "Thang điểm khác / Điểm chữ", labelEn: "Other Scale / Letter Grade" },
];

export const TIME_COMMITMENT_OPTIONS = [
  { id: "under_5h", labelVi: "Dưới 5 giờ / tuần", labelEn: "Under 5 hours / week" },
  { id: "5_to_10h", labelVi: "Từ 5 - 10 giờ / tuần", labelEn: "5 - 10 hours / week" },
  { id: "over_10h", labelVi: "Trên 10 giờ / tuần", labelEn: "Over 10 hours / week" },
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
      "Thực chiến với Server GPU & Cluster thực tế của CLB",
      "Xây dựng RAG, AI Agent, Data Pipeline & Web App",
      "Mentorship 1:1 từ các anh chị kinh nghiệm trong ngành",
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
      "Nơi biến các ý tưởng công nghệ thành hình ảnh, bài viết truyền cảm hứng và điều phối các Hackathon, Workshop công nghệ quy mô lớn cho cộng đồng sinh viên.",
    descriptionEn:
      "Transform tech ideas into inspiring visual stories and operate large-scale Hackathons, Tech Workshops & Community events for all university students.",
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
      "Tham gia Big Data Club (BDC) để cùng học hỏi, thực chiến các dự án dữ liệu lớn, AI, công nghệ tiên tiến và phát triển bản thân trong môi trường trẻ trung, năng động. Chào đón sinh viên TẤT CẢ các trường Đại học!",
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
    emailSchool: "Email sinh viên / Trường học (Tùy chọn)",
    emailSchoolPh: "Ví dụ: anh.nguyen26@st.hcmut.edu.vn (Bỏ qua nếu chưa được cấp)",
    facebookLink: "Link Facebook / Zalo / LinkedIn cá nhân *",
    facebookLinkPh: "Ví dụ: https://facebook.com/nguyenvana hoặc link profile cá nhân",
    university: "Trường Đại học đang theo học *",
    universityPh: "Ví dụ: Trường Đại học Bách Khoa, UTE, FPT, KHTN...",
    faculty: "Khoa / Ngành học *",
    facultyPh: "Ví dụ: Khoa Khoa học & Kỹ thuật Máy tính (CSE) / Công nghệ Thông tin",
    studentId: "Mã số sinh viên (MSSV)",
    studentIdPh: "Ví dụ: 2410123 (Nếu chưa có ghi 'Chưa có')",
    academicStatus: "Năm học hiện tại *",
    academicStatusOtherPh: "Vui lòng ghi rõ trình độ hoặc trạng thái hiện tại...",

    // Step 2
    step2Header: "Hồ sơ Học tập & Minh chứng",
    step2Desc: "Cung cấp kết quả học tập và minh chứng để BDC đánh giá đúng năng lực của bạn.",
    freshmanNoticeTitle: "Dành cho Tân Sinh viên (Khóa 2026)",
    freshmanNoticeDesc: "Chào mừng bạn! Vui lòng chọn Phương thức trúng tuyển Đại học và cập nhật điểm số tương ứng.",
    seniorNoticeTitle: "Dành cho Sinh viên từ Năm 1 trở đi",
    seniorNoticeDesc: "Vui lòng cập nhật điểm GPA tích lũy và điểm học kỳ gần nhất của bạn.",
    entranceMethodLabel: "Phương thức xét tuyển / trúng tuyển Đại học của bạn *",
    entranceMethodPh: "Chọn phương thức xét tuyển...",
    entranceScoreDetailLabel: "Chi tiết điểm số / kết quả trúng tuyển *",
    entranceScoreDetailPh: "Ví dụ: Khối A00: 27.5 (Toán 9.2, Lý 9.0, Hóa 9.3) hoặc ĐGNL HCM: 950/1200",
    gpaCumulative: "GPA tích lũy *",
    gpaCumulativePh: "Ví dụ: 3.65 / 4.0 hoặc 8.2 / 10.0",
    gpaLatest: "GPA học kỳ gần nhất *",
    gpaLatestPh: "Ví dụ: 3.78 / 4.0 hoặc 8.5 / 10.0",
    gpaScaleLabel: "Thang điểm GPA *",
    thptDgnlScores: "Điểm thi THPT và / hoặc ĐGNL *",
    thptDgnlScoresPh: "Ví dụ: THPT: 28.5 | ĐGNL: 950/1200",
    thptScore: "Điểm thi Tốt nghiệp THPT *",
    thptScorePh: "Ví dụ: Toán 9.0, Lý 8.5, Hóa 9.0 (hoặc Tổng điểm: 26.5)",
    hasDgnl: "Bạn có tham gia Kỳ thi ĐGNL ĐHQG-HCM không? *",
    hasDgnlPh: "Chọn câu trả lời...",
    dgnlScore: "Điểm thi ĐGNL ĐHQG-HCM *",
    dgnlScorePh: "Ví dụ: 920 / 1200",
    errDgnlRequired: "Vui lòng nhập điểm thi ĐGNL của bạn.",
    achievementsExtracurricular: "Thành tích học tập & Hoạt động ngoại khóa (nếu chưa có ghi 'Chưa có')",
    achievementsExtracurricularPh: "Ví dụ: Giải Nhất HSG môn Tin học, Trưởng ban Truyền thông CLB cấp 3, Học bổng...",
    englishCert: "Chứng chỉ Tiếng Anh (nếu chưa có ghi 'Chưa có') *",
    englishCertPh: "Ví dụ: IELTS 7.5 / TOEIC 850 / VSTEP B2 hoặc ghi 'Chưa có'",
    englishCertType: "Loại chứng chỉ Tiếng Anh *",
    englishCertTypePh: "Tìm hoặc nhập chứng chỉ (IELTS, TOEIC, PTE...)",
    englishCertScore: "Điểm số chứng chỉ *",
    englishCertScorePh: "Ví dụ: 7.5 (hoặc 850, B2...)",
    cvUploadLabel: "CV ứng tuyển (Định dạng PDF, tối đa 10MB) *",
    cvUploadLabelFreshman: "CV ứng tuyển (PDF, tối đa 10MB - Tùy chọn cho Tân sinh viên)",
    cvUploadHint: "Bản CV chi tiết giúp Ban Nhân sự hiểu rõ hành trình và kỹ năng của bạn.",
    cvBioTextLabel: "Tóm tắt kinh nghiệm, kỹ năng & dự án cá nhân (Nếu chưa có file CV) *",
    cvBioTextPh: "Ví dụ: Em có nền tảng về Python, C++, từng tham gia cuộc thi HSG Tin học cấp trường...",
    cvBioTextHint: "Nếu bạn là Tân sinh viên và chưa có file CV sẵn, hãy viết tóm tắt ngắn gọn ở đây.",
    evidenceUploadLabel: "Minh chứng / Bảng điểm / Giấy khen đi kèm (Tùy chọn, tối đa 5 file)",
    evidenceUploadHint: "Tải lên ảnh chứng chỉ Tiếng Anh, Bảng điểm học kỳ, Giấy khen (PNG, JPG, PDF)...",

    // Step 3
    step3Header: "Lựa chọn Ban & Kỳ vọng",
    step3Desc: "Lựa chọn Ban phù hợp nhất với định hướng và chia sẻ kỳ vọng của bạn khi gia nhập BDC.",
    deptSelectLabel: "Ban ứng tuyển Nguyện vọng 1 *",
    deptSelectHint: "Đọc kỹ đặc quyền, cơ hội và yêu cầu chuyên môn của từng Ban trước khi lựa chọn.",
    secondDeptSelectLabel: "Ban ứng tuyển Nguyện vọng 2 (Tùy chọn)",
    secondDeptSelectHint: "Nếu không trúng tuyển NV1, bạn có muốn BDC cân nhắc hồ sơ ở Ban khác không?",
    allowDeptAdjustmentLabel: "Tôi đồng ý để Ban Nhân sự cân nhắc điều phối sang Ban phù hợp khác nếu cần",
    weeklyTimeCommitmentLabel: "Thời gian bạn có thể dành cho hoạt động BDC mỗi tuần *",
    motivationLabel: "Lý do & Động lực ứng tuyển vào Big Data Club *",
    motivationHint: "Chia sẻ ngắn gọn mục tiêu cá nhân, kỹ năng muốn rèn luyện hoặc đóng góp của bạn cho CLB...",
    motivationPh: "Ví dụ: Em muốn rèn luyện tư duy lập trình hệ thống, tham gia phát triển dự án AI thực tế và học hỏi kinh nghiệm từ các anh chị tại BDC...",
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
    errFacebook: "Vui lòng nhập liên kết hợp lệ.",
    errCvRequired: "Vui lòng tải lên file CV hoặc điền tóm tắt bản thân.",
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
      "Join Big Data Club (BDC) to build real-world AI & Big Data projects, master cloud technologies, and accelerate your growth in a dynamic tech community. Open to students from ALL universities!",
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
    emailSchool: "University Email (Optional)",
    emailSchoolPh: "e.g. alex.nguyen26@st.hcmut.edu.vn (Leave blank if not issued yet)",
    facebookLink: "Facebook / Zalo / LinkedIn Profile Link *",
    facebookLinkPh: "e.g. https://facebook.com/alexnguyen or social profile URL",
    university: "University *",
    universityPh: "e.g. HCMUT, UIT, UTE, FPT, International University...",
    faculty: "Faculty / Major *",
    facultyPh: "e.g. Computer Science & Engineering (CSE)",
    studentId: "Student ID (MSSV)",
    studentIdPh: "e.g. 2410123 (Enter 'None' if not available yet)",
    academicStatus: "Academic Status *",
    academicStatusOtherPh: "Specify your current academic status...",

    // Step 2
    step2Header: "Academic Profile & Credentials",
    step2Desc: "Share your academic achievements, language certificates, and upload your CV.",
    freshmanNoticeTitle: "For Freshmen (Entry 2026)",
    freshmanNoticeDesc: "Welcome! Please select your University Entrance Method and specify your scores.",
    seniorNoticeTitle: "For 1st, 2nd & 3rd Year Students",
    seniorNoticeDesc: "Please update your cumulative GPA and latest semester GPA.",
    entranceMethodLabel: "University Entrance Admission Method *",
    entranceMethodPh: "Select admission method...",
    entranceScoreDetailLabel: "Score Details / Admission Result *",
    entranceScoreDetailPh: "e.g. High School Exam: 27.5 or Competency Test: 950/1200",
    gpaCumulative: "Cumulative GPA *",
    gpaCumulativePh: "e.g. 3.65 / 4.0 or 8.2 / 10.0",
    gpaLatest: "Latest Semester GPA *",
    gpaLatestPh: "e.g. 3.78 / 4.0 or 8.5 / 10.0",
    gpaScaleLabel: "GPA Scale *",
    thptDgnlScores: "High School Exam / Competency Test Scores *",
    thptDgnlScoresPh: "e.g. National Exam: 28.5 | Competency Test: 950/1200",
    thptScore: "High School Graduation Exam Score *",
    thptScorePh: "e.g. Math 9.0, Phys 8.5, Chem 9.0 or Total: 26.5",
    hasDgnl: "Did you take the Competency Test (ĐGNL)? *",
    hasDgnlPh: "Select answer...",
    dgnlScore: "Competency Test Score *",
    dgnlScorePh: "e.g. 920/1200",
    errDgnlRequired: "Please enter your Competency Test (ĐGNL) score.",
    achievementsExtracurricular: "Achievements & Extracurricular Activities (enter 'None' if applicable)",
    achievementsExtracurricularPh: "e.g. Provincial Informatics Award, High School Club Lead, Academic Scholarship...",
    englishCert: "English Certificates (enter 'None' if applicable) *",
    englishCertPh: "e.g. IELTS 7.5 / TOEIC 850 / VSTEP B2 / None",
    englishCertType: "English Certificate Type *",
    englishCertTypePh: "Search or enter certificate (IELTS, TOEIC, PTE...)",
    englishCertScore: "Certificate Score *",
    englishCertScorePh: "e.g. 7.5 (or 850, B2...)",
    cvUploadLabel: "Upload Your CV (PDF, max 10MB) *",
    cvUploadLabelFreshman: "Upload Your CV (PDF, max 10MB - Optional for Freshmen)",
    cvUploadHint: "A strong CV will make your application stand out!",
    cvBioTextLabel: "Summary of Experience, Skills & Projects (If CV file is not available) *",
    cvBioTextPh: "e.g. I have basic knowledge in Python, C++, participated in high school coding contests...",
    cvBioTextHint: "If you are a freshman without a ready CV file, please write a brief summary here.",
    evidenceUploadLabel: "Supporting Documents / Transcripts (Optional, max 5 files)",
    evidenceUploadHint: "Upload certificates, grade transcripts, or awards (PNG, JPG, PDF)...",

    // Step 3
    step3Header: "Department Selection & Aspirations",
    step3Desc: "Select the department that best aligns with your goals and tell us your expectations.",
    deptSelectLabel: "Preferred Department (1st Preference) *",
    deptSelectHint: "Explore role descriptions and required skills for each department below.",
    secondDeptSelectLabel: "Secondary Preference (2nd Choice - Optional)",
    secondDeptSelectHint: "Would you like BDC to consider your profile for another department if 1st choice is full?",
    allowDeptAdjustmentLabel: "I agree to let the BDC HR team reassign me to a suitable department if needed",
    weeklyTimeCommitmentLabel: "Estimated Weekly Time Commitment *",
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
    errFacebook: "Please enter a valid URL.",
    errCvRequired: "Please upload your CV file or fill in the bio summary.",
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

