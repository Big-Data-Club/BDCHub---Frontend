export type TenantLandingConfig = {
  slug: string;
  organizationSlug: string;
  name: string;
  shortName: string;
  logo: string;
  description: string;
  headline: string;
  introduction: string;
  highlights: readonly { title: string; description: string }[];
};

// Branding only. Organization membership and data access remain backend-owned.
const tenants: readonly TenantLandingConfig[] = [
  {
    slug: "trungtamdientoan",
    organizationSlug: "trungtamdientoan",
    name: "Trung tâm Điện toán Bách Khoa",
    shortName: "CCE",
    logo: "/partner/logos/cce-seal.png",
    description: "Cổng học tập của Trung tâm Điện toán Bách Khoa trên nền tảng BDC Hub.",
    headline: "Kết nối tri thức. Phát triển kỹ năng số.",
    introduction: "Không gian học tập trực tuyến dành cho học viên Trung tâm Điện toán Bách Khoa. Truy cập khóa học, tài liệu và tiếp tục hành trình học tập của bạn tại một nơi.",
    highlights: [
      { title: "Học tập trực tuyến", description: "Truy cập các khóa học được cấp quyền bằng tài khoản của bạn." },
      { title: "Tài liệu học tập", description: "Theo dõi nội dung bài học và tài liệu trong từng khóa học." },
      { title: "Theo dõi tiến độ", description: "Tiếp tục bài học và xem lại quá trình học tập trên hệ thống." },
    ],
  },
];

export function getTenantLanding(slug: string): TenantLandingConfig | undefined {
  return tenants.find((tenant) => tenant.slug === slug);
}

export function getTenantSlugs(): string[] {
  return tenants.map((tenant) => tenant.slug);
}
