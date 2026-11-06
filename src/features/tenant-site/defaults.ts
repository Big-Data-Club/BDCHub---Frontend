import type { SiteDocument, SiteSection } from "./types";

export function newSection(type: SiteSection["type"] = "text"): SiteSection {
  return {
    id: crypto.randomUUID(),
    type,
    enabled: true,
    title: "Tiêu đề mới",
    body: "Nội dung giới thiệu của bạn.",
    image: "",
    buttonLabel: "",
    buttonHref: "",
    align: "left",
    tone: "plain",
    items: [],
  };
}

export function defaultSite(name: string, sample = false): SiteDocument {
  const titles = [
    "Giới thiệu chung",
    "Lịch sử hình thành",
    "Lĩnh vực hoạt động",
    "Tổ chức nhân sự",
    "Liên hệ",
  ];
  const slugs = [
    "gioi-thieu-chung",
    "lich-su-hinh-thanh",
    "linh-vuc-hoat-dong",
    "to-chuc-nhan-su",
    "lien-he",
  ];

  const sampleBodies = [
    `Trung tâm Kỹ Thuật Điện toán (Center of Computer Engineering) thuộc Trường Đại Học Bách Khoa – Đại học Quốc gia TP. Hồ Chí Minh là một trong những đơn vị đi đầu trong việc đào tạo Tin học và thực hiện các dịch vụ chuyển giao công nghệ.\n\nHơn 30 năm hoạt động trong lĩnh vực công nghệ thông tin, với đội ngũ Cán bộ của Khoa Khoa học Kỹ thuật và Máy tính (Khoa Công nghệ Thông tin) giàu kinh nghiệm, Trung tâm luôn khẳng định vị thế tiên phong trong đào tạo thực chiến và ứng dụng công nghệ số.`,
    `Được thành lập từ những năm đầu phát triển ngành Công nghệ Thông tin tại Đại học Bách Khoa TP.HCM, Trung tâm đã đào tạo hàng trăm ngàn học viên, sinh viên và kỹ sư công nghệ, đồng thời là đối tác chuyển giao công nghệ tin cậy cho nhiều cơ quan, doanh nghiệp trọng điểm trong và ngoài nước.`,
    `Trung tâm Kỹ Thuật Điện Toán hoạt động trên 03 lĩnh vực chính:\n\n1. Đào tạo các chứng chỉ tin học chuẩn quốc gia và quốc tế.\n2. Thực hiện các dịch vụ khoa học và công nghệ về tin học, chuyển đổi số.\n3. Nghiên cứu và chuyển giao công nghệ phần mềm, dữ liệu lớn và trí tuệ nhân tạo.\n\n### Đào tạo chuyên môn\n- Tin học ngắn hạn: Lập trình Python, Web, Mobile, Data Engineering, AI/ML.\n- Đào tạo doanh nghiệp và bồi dưỡng kỹ năng số chuyên sâu theo yêu cầu.`,
    `PGS TS. Thoại Nam Chức vụ: Giám đốc Email: nam@cse.hcmut.edu.vn Website: www.cse.hcmut.edu.vn/~nam\n\nTS. Dương Ngọc Hiếu Chức vụ: Phó giám đốc Email: dnhieu@hcmut.edu.vn Website: www.cse.hcmut.edu.vn/~dnhieu Thông tin khác: Chuyên ngành công nghệ thông tin\n\nThS. Lê Quốc Tuấn Chức vụ: Phó giám đốc Email: lqtuan@hcmut.edu.vn Website: http://www4.hcmut.edu.vn/~lqtuan Thông tin khác: Chuyên ngành công nghệ thông tin\n\nThS. Ngô Quang Nhựt Chức vụ: Phó giám đốc Điện thoại: 0813 23 04 33 Email: nhutnq@hcmut.edu.vn Thông tin khác: Chuyên ngành công nghệ thông tin\n\nCN. Trần Thị Ngọc Diễm Chức vụ: Kế toán trưởng Điện thoại: 01666444566 Email: ngocdiemkt28@gmail.com`,
    `Chúng tôi luôn sẵn sàng hỗ trợ quý học viên, sinh viên và đối tác. Hãy liên hệ với chúng tôi để được tư vấn lộ trình học tập và hợp tác hiệu quả nhất.`,
  ];

  const pages = titles.map((title, i) => ({
    title,
    slug: slugs[i],
    sections: [
      {
        ...newSection(i === 4 ? "contact" : "text"),
        title: "",
        body: sample ? sampleBodies[i] : `Cập nhật thông tin ${title.toLowerCase()} tại đây.`,
      },
    ],
  }));

  return {
    schemaVersion: 1,
    template: "modern",
    primaryColor: "#075985",
    tagline: "Đào tạo • Công nghệ • Kết nối",
    footerText: name,
    contact: {
      hotline: sample ? "0902 44 91 98" : "",
      email: sample ? "dientoan@hcmut.edu.vn" : "",
      address: sample
        ? "P. 606 - Nhà C6 - 268 Lý Thường Kiệt - Phường Diên Hồng - TP. Hồ Chí Minh.\nKIOS 8 - 142 Tô Hiến Thành - Phường Diên Hồng - TP. Hồ Chí Minh."
        : "",
      hours: sample ? "Thứ 2 – Thứ 7: 07:30 – 20:30" : "",
      zaloUrl: sample ? "https://zalo.me/0902449198" : "",
      mapUrl: sample ? "https://maps.google.com/?q=268+Ly+Thuong+Kiet+TPHCM" : "",
    },
    slides: [],
    slideInterval: 5,
    autoplay: false,
    menu: [
      { label: "Trang chủ", href: "/", children: [] },
      {
        label: "Giới thiệu",
        href: "/thong-tin/gioi-thieu-chung",
        children: pages.slice(0, 4).map(page => ({
          label: page.title,
          href: `/thong-tin/${page.slug}`,
          children: [],
        })),
      },
      { label: "Liên hệ", href: "/thong-tin/lien-he", children: [] },
      { label: "Học trực tuyến", href: "/lms", children: [] },
    ],
    sections: [
      {
        ...newSection("hero"),
        title: name,
        body: "Kết nối tri thức. Phát triển kỹ năng số. Nền tảng học tập và nghiên cứu công nghệ hiện đại.",
        tone: "brand",
        buttonLabel: "Vào hệ thống học tập",
        buttonHref: "/lms",
      },
      {
        ...newSection("cards"),
        title: "Không gian đào tạo & Nghiên cứu",
        items: [
          {
            title: "Học tập trực tuyến (LMS)",
            body: "Truy cập các khóa học lập trình, kỹ thuật và công nghệ với lộ trình rõ ràng.",
            image: "",
            href: "/lms",
          },
          {
            title: "Phòng thực hành (Labs)",
            body: "Trải nghiệm môi trường thực hành đám mây tương tác, giả lập hạ tầng thực tế.",
            image: "",
            href: "/labs",
          },
          {
            title: "Nông trại kiến thức",
            body: "Học tập tương tác gamification, ôn tập kiến thức sinh động và cuốn hút.",
            image: "",
            href: "/knowledge-farm",
          },
        ],
      },
      {
        ...newSection("contact"),
        title: "Liên hệ hợp tác & Tư vấn",
        body: "Chúng tôi luôn sẵn sàng đồng hành cùng học viên và doanh nghiệp.",
      },
    ],
    pages,
  };
}
