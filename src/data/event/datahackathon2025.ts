import { EventConfig } from "@/types/event";

export const hackathon2025Data: EventConfig = {
  id: "bdc-data-hackathon-2025",
  title: "BDC DATA HACKATHON 2025",
  subtitle: "Chinh phục thử thách dữ liệu - Tỏa sáng tài năng",
  registrationStart: new Date('2025-10-30'),
  registrationEnd: new Date('2025-11-09T23:59:59'),
  location: "ĐH Bách Khoa TP.HCM",
  totalPrizePool: "10.000.000 VNĐ",
  registrationLink: "https://forms.gle/p2JvvW78S5nndvePA",
  
  objectives: [
    "Tạo sân chơi học thuật lành mạnh cho sinh viên",
    "Thúc đẩy đổi mới sáng tạo và chuyển đổi số",
    "Tìm giải pháp thực tiễn cho vấn đề hiện tại",
    "Phát hiện và ươm mầm tài năng trẻ"
  ],
  
  structure: [
    { phase: "Vòng 1: Đăng ký & Sơ loại", time: "30/10 - 09/11/2025", description: "Online" },
    { phase: "Vòng 2: Thi trực tiếp", time: "22/11/2025", description: "On-site tại ĐHBK" },
    { phase: "Vòng 3: Chung kết", time: "23/11/2025", description: "Thuyết trình tại C5" }
  ],

  prizes: [
    { title: "Giải Nhất", amount: "5.000.000 VNĐ", icon: "🥇" },
    { title: "Giải Nhì", amount: "3.000.000 VNĐ", icon: "🥈" },
    { title: "Giải Ba", amount: "2.000.000 VNĐ", icon: "🥉" }
  ],

  timelines: [
    {
      id: "round-2",
      title: "Lịch trình Vòng 2 - On-site",
      date: new Date('2025-11-22'),
      events: [
        { time: '08:00', title: 'Check-in', description: 'Chương trình văn nghệ chào mừng' },
        { time: '08:30', title: 'Lễ khai mạc', description: 'PGS.TS Thoại Nam phát biểu khai mạc' },
        { time: '09:00', title: 'Công bố đề thi', description: 'Phổ biến nội dung cuộc thi và nhận dữ liệu' },
        { time: '09:30', title: 'Bắt đầu làm bài', description: 'Các đội bắt đầu phân tích và xử lý dữ liệu' },
        { time: '12:00', title: 'Nghỉ trưa', description: 'Nghỉ ngơi và ăn trưa (30 phút)' },
        { time: '17:00', title: 'Nộp bài', description: 'Kết thúc vòng thi số 2' },
        { time: '19:00', title: 'Kết quả', description: 'Thông báo kết quả vòng thi số 2 trên Fanpage' },
      ]
    },
    {
      id: "round-3",
      title: "Lịch trình Vòng 3 - Chung kết",
      date: new Date('2025-11-23'),
      events: [
        { time: '08:00', title: 'Check-in', description: 'Đón tiếp các bạn thí sinh và khách mời' },
        { time: '08:15', title: 'Thuyết trình sản phẩm', description: 'Các đội thi trình bày về sản phẩm của mình để chấm điểm' },
        { time: '11:00', title: 'Công bố kết quả', description: 'Công bố kết quả vòng 3' },
      ]
    }
  ]
};