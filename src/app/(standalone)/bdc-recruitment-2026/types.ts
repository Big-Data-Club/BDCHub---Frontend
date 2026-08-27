export type Lang = "vi" | "en";

export type AcademicStatus = "freshman" | "year1" | "year2" | "year3" | "year4" | "other";

export type DepartmentId = "rd" | "community";

export type EntranceMethod =
  | "combo_thpt_dgnl"
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
  thptBlock?: string;
  thptBlockOther?: string;
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
  { id: "freshman", labelVi: "Tân sinh viên (Năm 1)", labelEn: "Freshman (1st Year)" },
  { id: "year1", labelVi: "Năm 1", labelEn: "1st Year" },
  { id: "year2", labelVi: "Năm 2", labelEn: "2nd Year" },
  { id: "year3", labelVi: "Năm 3", labelEn: "3rd Year" },
  { id: "year4", labelVi: "Năm 4", labelEn: "4th Year" },
  { id: "other", labelVi: "Khác (Vui lòng điền bên dưới)", labelEn: "Other (Please specify below)" },
];

export const THPT_BLOCK_OPTIONS = [
  { id: "A00", labelVi: "Khối A00 (Toán, Vật lý, Hóa học)", labelEn: "Block A00 (Math, Phys, Chem)" },
  { id: "A01", labelVi: "Khối A01 (Toán, Vật lý, Tiếng Anh)", labelEn: "Block A01 (Math, Phys, Eng)" },
  { id: "B00", labelVi: "Khối B00 (Toán, Hóa học, Sinh học)", labelEn: "Block B00 (Math, Chem, Bio)" },
  { id: "C00", labelVi: "Khối C00 (Ngữ văn, Lịch sử, Địa lý)", labelEn: "Block C00 (Lit, Hist, Geo)" },
  { id: "D01", labelVi: "Khối D01 (Toán, Ngữ văn, Tiếng Anh)", labelEn: "Block D01 (Math, Lit, Eng)" },
  { id: "D07", labelVi: "Khối D07 (Toán, Hóa học, Tiếng Anh)", labelEn: "Block D07 (Math, Chem, Eng)" },
  { id: "D08", labelVi: "Khối D08 (Toán, Sinh học, Tiếng Anh)", labelEn: "Block D08 (Math, Bio, Eng)" },
  { id: "hocba", labelVi: "Xét tuyển Học bạ THPT", labelEn: "High School Academic Transcript" },
  { id: "other", labelVi: "Tổ hợp / Phương thức khác", labelEn: "Other Combination / Method" },
];

export const ENTRANCE_METHOD_OPTIONS = [
  { id: "combo_thpt_dgnl" as EntranceMethod, labelVi: "Có cả Điểm THPT & Đánh giá năng lực (Khuyên dùng)", labelEn: "Both High School Exam & Competency Test (Recommended)" },
  { id: "thpt" as EntranceMethod, labelVi: "Chỉ dùng Điểm thi Tốt nghiệp THPT QG", labelEn: "High School Exam Scores Only" },
  { id: "dgnl_hcm" as EntranceMethod, labelVi: "Chỉ dùng Kỳ thi Đánh giá năng lực (ĐHQG TP.HCM / Hà Nội / TSA)", labelEn: "Competency Test Scores Only (VNU-HCM / VNU-HN / TSA)" },
  { id: "hocba" as EntranceMethod, labelVi: "Xét tuyển Học bạ THPT", labelEn: "High School Academic Transcript Review" },
  { id: "direct_international" as EntranceMethod, labelVi: "Xét tuyển thẳng / Chứng chỉ Quốc tế (SAT, IB, HSG...)", labelEn: "Direct Admission / International Certs (SAT/IB/IELTS...)" },
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
    badgeVi: "Engineering & AI Stack",
    badgeEn: "Engineering & AI Stack",
    taglineVi: "Phát triển Hệ thống, Mô hình AI & Hạ tầng Dữ liệu lớn",
    taglineEn: "Systems, AI Agents & Big Data Infrastructure",
    descriptionVi:
      "Khám phá và đào sâu các chủ đề về Dữ liệu thông qua việc đọc tài liệu, thảo luận, nghiên cứu và triển khai dự án thực tế.",
    descriptionEn:
      "Explore data-related topics through reading, discussion, research, and project work.",
    fitTitleVi: "Ban R&D sẽ là lựa chọn phù hợp dành cho bạn nếu:",
    fitTitleEn: "You will be a good fit if you:",
    highlightsVi: [
      "Đọc, thảo luận các bài báo khoa học & tài liệu nghiên cứu công nghệ.",
      "Tham gia phát triển các dự án mang tính nghiên cứu & giải pháp dựa trên dữ liệu.",
      "Yêu thích học thuật, đổi mới sáng tạo, có khả năng tự học và chủ động giải quyết bài toán thực tế.",
    ],
    highlightsEn: [
      "Read and discuss research papers & tech publications.",
      "Work on research-oriented and data-driven projects/solutions.",
      "Enjoy academics and innovation, can learn independently, and love solving real problems.",
    ],
    skillsVi: ["Python / C++ / Go / TS", "RAG & LLM Agents", "Vector DB & Pipelines", "Docker / Kafka / Kubernetes"],
    skillsEn: ["Python / C++ / Go / TS", "RAG & LLM Agents", "Vector DB & Pipelines", "Docker / Kafka / Kubernetes"],
  },
  {
    id: "community" as DepartmentId,
    nameVi: "Community (Truyền thông & Sự kiện)",
    nameEn: "Community (Media & Events)",
    badgeVi: "Creative & Growth",
    badgeEn: "Creative & Growth",
    taglineVi: "Sáng tạo Nội dung, Thiết kế Thương hiệu & Vận hành Sự kiện Công nghệ",
    taglineEn: "Content Creation, Visual Design & Tech Event Operations",
    descriptionVi:
      "Hỗ trợ tổ chức các hoạt động, kết nối các thành viên và cùng nhau xây dựng một cộng đồng câu lạc bộ năng động.",
    descriptionEn:
      "Help organize activities, connect members, and create an active club community.",
    fitTitleVi: "Ban Community sẽ là lựa chọn phù hợp dành cho bạn nếu:",
    fitTitleEn: "You will be a good fit if you:",
    highlightsVi: [
      "Trực tiếp lên kế hoạch tổ chức các hoạt động, sự kiện và gắn kết thành viên CLB.",
      "Cùng xây dựng môi trường câu lạc bộ cởi mở, thân thiện và giàu tính kết nối.",
      "Yêu thích làm việc với con người, giao tiếp khéo léo, có tinh thần chủ động và trách nhiệm.",
    ],
    highlightsEn: [
      "Organize club activities, events, and support all members.",
      "Help build a welcoming and collaborative club environment.",
      "Enjoy working with people, communicate well, and take initiative on tasks.",
    ],
    skillsVi: ["Tech Copywriting", "Figma / Photoshop UI", "Media & Video Production", "Event & Sponsor Management"],
    skillsEn: ["Tech Copywriting", "Figma / Photoshop UI", "Media & Video Production", "Event & Sponsor Management"],
  },
];

export const T = {
  vi: {
    heroBadge: "TUYỂN THÀNH VIÊN 2026",
    heroTitle: "BIG DATA CLUB RECRUITMENT 2026",
    heroSubtitle: "THINK BIG. SPEAK DATA.",
    heroDesc:
      "Gia nhập BDC để trực tiếp tham gia các dự án AI & Dữ liệu lớn thực tế, trải nghiệm cụm máy chủ GPU riêng và phát triển cùng cộng đồng sinh viên đam mê công nghệ. Tuyển sinh mở rộng cho sinh viên tất cả các trường Đại học!",
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
    emailPersonal: "Email cá nhân (Tùy chọn)",
    emailPersonalPh: "Ví dụ: nguyenvana@gmail.com (Bỏ qua nếu không dùng)",
    emailSchool: "Email sinh viên / Trường học *",
    emailSchoolPh: "Ví dụ: anh.nguyen26@st.hcmut.edu.vn",
    facebookLink: "Link Facebook cá nhân (hoặc Zalo/LinkedIn) *",
    facebookLinkPh: "facebook.com/username hoặc link trang cá nhân của bạn",
    facebookLinkHint: "Ưu tiên Facebook cá nhân để Ban Nhân sự dễ dàng liên hệ phỏng vấn.",
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
    freshmanNoticeDesc: "",
    seniorNoticeTitle: "Dành cho Sinh viên từ Năm 1 trở đi",
    seniorNoticeDesc: "",
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
    achievementsExtracurricular: "Thành tích học tập & Hoạt động ngoại khóa (Nếu có)",
    achievementsExtracurricularPh: "Ví dụ: Giải Nhất HSG môn Tin học, Trưởng ban Truyền thông CLB cấp 3, Học bổng...",
    englishCert: "Chứng chỉ Tiếng Anh (nếu chưa có ghi 'Chưa có') *",
    englishCertPh: "Ví dụ: IELTS 7.5 / TOEIC 850 / VSTEP B2 hoặc ghi 'Chưa có'",
    englishCertType: "Loại chứng chỉ Tiếng Anh *",
    englishCertTypePh: "Tìm hoặc nhập chứng chỉ (IELTS, TOEIC, PTE...)",
    englishCertScore: "Điểm số chứng chỉ *",
    englishCertScorePh: "Ví dụ: 7.5 (hoặc 850, B2...)",
    cvUploadLabel: "CV ứng tuyển (Định dạng PDF, tối đa 10MB) *",
    cvUploadLabelFreshman: "CV ứng tuyển (PDF, tối đa 10MB - Tùy chọn cho Tân sinh viên)",
    cvUploadHint: "Một bản CV chỉn chu sẽ giúp bạn tạo ấn tượng tốt hơn với BDC!",
    cvBioTextLabel: "Tóm tắt kinh nghiệm, kỹ năng & dự án cá nhân (Nếu chưa có file CV) *",
    cvBioTextPh: "Ví dụ: Em có nền tảng về Python, C++, từng tham gia cuộc thi HSG Tin học cấp trường...",
    cvBioTextHint: "Nếu bạn là Tân sinh viên và chưa có file CV sẵn, hãy viết tóm tắt ngắn gọn ở đây.",
    evidenceUploadLabel: "Minh chứng / Bảng điểm / Giấy khen đi kèm (Tùy chọn, tối đa 5 file)",
    evidenceUploadHint: "Tải lên ảnh chứng chỉ Tiếng Anh, Bảng điểm học kỳ, Giấy khen (PNG, JPG, PDF)...",

    // Step 3
    step3Header: "Lựa chọn Ban & Định hướng",
    step3Desc: "Chọn Ban phù hợp với sở thích của bạn và chia sẻ điều bạn thực sự muốn đạt được khi tham gia BDC.",
    deptSelectLabel: "Ban ứng tuyển *",
    deptSelectHint: "Mỗi Ban có góc nhìn và trải nghiệm riêng. Bạn chọn Ban cảm thấy hào hứng nhất nhé:",
    secondDeptSelectLabel: "Nguyện vọng dự phòng (Tùy chọn)",
    secondDeptSelectHint: "Nếu NV1 đã đủ chỉ tiêu, bạn có muốn BDC xem xét hồ sơ của bạn ở Ban còn lại?",
    allowDeptAdjustmentLabel: "Tôi sẵn sàng chuyển sang Ban còn lại nếu Ban Nhân sự thấy hồ sơ phù hợp hơn",
    weeklyTimeCommitmentLabel: "Thời gian bạn có thể dành cho BDC hàng tuần *",
    motivationLabel: "Kỳ vọng & Động lực gia nhập BDC *",
    motivationHint: "Hãy chia sẻ chân thành về điều bạn muốn nhận được hoặc giá trị bạn mong muốn đóng góp cho CLB:",
    motivationPh: "Ví dụ: Em mong muốn được làm các sản phẩm thực tế để học hỏi kinh nghiệm, làm đẹp CV và tìm kiếm những người bạn cùng định hướng...",
    motivationChipsLabel: "Gợi ý chủ đề nhanh (Bấm để chọn):",
    motivationChips: [
      "Thực hành dự án thực tế",
      "Học hỏi thêm kỹ năng",
      "Kinh nghiệm tổ chức Sự kiện & Hackathon",
      "Kết nối với những người cùng đam mê",
      "Tích lũy kinh nghiệm làm đẹp CV",
    ],
    sendCopyLabel: "Gửi bản sao đơn đăng ký qua Email xác nhận của tôi",

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
      "BDC sẽ đánh giá hồ sơ của bạn",
      "Thông báo tiếp theo sẽ được gửi qua Email",
      "Theo dõi các kênh truyền thông chính thức của BDC để không bỏ lỡ thông báo mới.",
    ],
    btnReturnHome: "Trở về Trang chủ BDC",
    btnFillNewForm: "Điền lại đơn mới",
    alreadySubmittedTitle: "Hồ Sơ Đã Được Ghi Nhận!",
    alreadySubmittedDesc: "Hệ thống xác nhận bạn đã hoàn thành nộp đơn ứng tuyển Big Data Club Recruitment 2026.",
  },
  en: {
    heroBadge: "RECRUITMENT 2026",
    heroTitle: "BIG DATA CLUB RECRUITMENT 2026",
    heroSubtitle: "THINK BIG. SPEAK DATA.",
    heroDesc:
      "Join BDC to build real-world AI & Big Data projects, gain hands-on access to private GPU server clusters, and grow alongside a passionate tech community. Open to students from ALL universities!",
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
    emailPersonal: "Personal Email (Optional)",
    emailPersonalPh: "e.g. alex.nguyen@gmail.com (Optional)",
    emailSchool: "University Email *",
    emailSchoolPh: "e.g. alex.nguyen26@st.hcmut.edu.vn",
    facebookLink: "Facebook Profile Link (or Zalo/LinkedIn) *",
    facebookLinkPh: "facebook.com/username or your social profile URL",
    facebookLinkHint: "Facebook profile is preferred for HR contact and interview scheduling.",
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
    freshmanNoticeDesc: "",
    seniorNoticeTitle: "For 1st, 2nd & 3rd Year Students",
    seniorNoticeDesc: "",
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
    achievementsExtracurricular: "Academic Achievements & Extracurricular Activities (Optional)",
    achievementsExtracurricularPh: "e.g. Provincial Informatics Award, High School Club Lead, Academic Scholarship...",
    englishCert: "English Certificates (enter 'None' if applicable) *",
    englishCertPh: "e.g. IELTS 7.5 / TOEIC 850 / VSTEP B2 / None",
    englishCertType: "English Certificate Type *",
    englishCertTypePh: "Search or enter certificate (IELTS, TOEIC, PTE...)",
    englishCertScore: "Certificate Score *",
    englishCertScorePh: "e.g. 7.5 (or 850, B2...)",
    cvUploadLabel: "Upload Your CV (PDF, max 10MB) *",
    cvUploadLabelFreshman: "Upload Your CV (PDF, max 10MB - Optional for Freshmen)",
    cvUploadHint: "A well-crafted CV will make a stronger impression on BDC!",
    cvBioTextLabel: "Summary of Experience, Skills & Projects (If CV file is not available) *",
    cvBioTextPh: "e.g. I have basic knowledge in Python, C++, participated in high school coding contests...",
    cvBioTextHint: "If you are a freshman without a ready CV file, please write a brief summary here.",
    evidenceUploadLabel: "Supporting Documents / Transcripts (Optional, max 5 files)",
    evidenceUploadHint: "Upload certificates, grade transcripts, or awards (PNG, JPG, PDF)...",

    // Step 3
    step3Header: "Department & Goals",
    step3Desc: "Choose the team that matches your passion and share what you genuinely hope to achieve at BDC.",
    deptSelectLabel: "Preferred Department *",
    deptSelectHint: "Each department offers a distinct experience. Select the team you are most excited about:",
    secondDeptSelectLabel: "Secondary Choice (Optional)",
    secondDeptSelectHint: "If your primary choice reaches capacity, would you like us to review your application for the other team?",
    allowDeptAdjustmentLabel: "I am open to being considered for the other department if HR finds it a better fit",
    weeklyTimeCommitmentLabel: "Weekly Time You Can Commit to BDC *",
    motivationLabel: "Expectations & Motivation to Join BDC *",
    motivationHint: "Share your genuine goals or how you hope to contribute to BDC:",
    motivationPh: "e.g., I want to build real projects to gain practical skills, enhance my CV, and connect with like-minded tech peers...",
    motivationChipsLabel: "Quick Topic Suggestions (Click to add):",
    motivationChips: [
      "Hands-on Project Experience",
      "Learn & Upgrade Skills",
      "Event & Hackathon Operations",
      "Connect with Like-Minded Peers",
      "Gain Experience for Resume/CV",
    ],
    sendCopyLabel: "Send a copy of my application via confirmation email",

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
      "BDC will review your application.",
      "Further updates will be sent via Email.",
      "Follow our Official Fanpage for real-time recruitment updates.",
    ],
    btnReturnHome: "Return to BDC Homepage",
    btnFillNewForm: "Submit Another Application",
    alreadySubmittedTitle: "Application Already Submitted!",
    alreadySubmittedDesc: "Our system indicates you have already completed and submitted your BDC 2026 application.",
  },
};

