import type { SiteDocument, SiteSection } from "./types";

export function newSection(type: SiteSection["type"] = "text"): SiteSection {
  return { id: crypto.randomUUID(), type, enabled: true, title: "Tiêu đề mới", body: "Nội dung giới thiệu của bạn.", image: "", buttonLabel: "", buttonHref: "", align: "left", tone: "plain", items: [] };
}

export function defaultSite(name: string, sample = false): SiteDocument {
  const titles = ["Giới thiệu chung", "Lịch sử hình thành", "Lĩnh vực hoạt động", "Tổ chức nhân sự", "Liên hệ"];
  const slugs = ["gioi-thieu-chung", "lich-su-hinh-thanh", "linh-vuc-hoat-dong", "to-chuc-nhan-su", "lien-he"];
  const pages = titles.map((title, i) => ({ title, slug: slugs[i], sections: [{ ...newSection(i === 4 ? "contact" : "text"), title: "", body: `Cập nhật thông tin ${title.toLowerCase()} tại đây.` }] }));
  return {
    schemaVersion: 1, template: "classic", primaryColor: "#075985", tagline: "Đào tạo • Công nghệ • Kết nối", footerText: name,
    contact: { hotline: sample ? "0902 44 91 98" : "", email: "", address: "", hours: "", zaloUrl: sample ? "https://zalo.me/0902449198" : "", mapUrl: "" },
    slides: [], slideInterval: 5, autoplay: false,
    menu: [{ label: "Trang chủ", href: "/", children: [] }, { label: "Giới thiệu", href: "/thong-tin/gioi-thieu-chung", children: pages.slice(0, 4).map(page => ({ label: page.title, href: `/thong-tin/${page.slug}`, children: [] })) }, { label: "Liên hệ", href: "/thong-tin/lien-he", children: [] }, { label: "Học trực tuyến", href: "/lms", children: [] }],
    sections: [{ ...newSection("hero"), title: name, body: "Kết nối tri thức. Phát triển kỹ năng số.", tone: "brand", buttonLabel: "Vào hệ thống học tập", buttonHref: "/lms" },
      { ...newSection("cards"), title: "Đồng hành cùng bạn", items: [{ title: "Học tập", body: "Khám phá không gian học tập trực tuyến.", image: "", href: "/lms" }, { title: "Thực hành", body: "Trải nghiệm phòng thí nghiệm tương tác.", image: "", href: "/labs" }] },
      { ...newSection("contact"), title: "Liên hệ", body: "Chúng tôi luôn sẵn sàng hỗ trợ bạn." }], pages,
  };
}
