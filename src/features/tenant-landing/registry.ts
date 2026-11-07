import "server-only";
import { cache } from "react";
import type { Organization } from "@/types/admin/organization";

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

// Accept public image URLs only; never use organization input as a fetch target.
function publicLogo(value: string | undefined): string {
  if (!value || value.includes("\\")) return "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

// Request-scoped deduplication for metadata + page. No build-time org snapshot.
export const getTenantLanding = cache(async (slug: string): Promise<TenantLandingConfig | undefined> => {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(slug)) return undefined;
  const base = process.env.BACKEND_URL || "http://auth-service:8080";
  const response = await fetch(`${base.replace(/\/$/, "")}/api/organizations/slug/${encodeURIComponent(slug)}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Organization lookup failed (${response.status})`);
  const org: Organization = await response.json();
  if (!org.is_active || !org.name || org.slug !== slug) return undefined;
  return {
    slug: org.slug,
    organizationSlug: org.slug,
    name: org.name,
    shortName: org.name,
    logo: publicLogo(org.logo_url),
    description: org.description || `Cổng học tập của ${org.name} trên nền tảng BDC Hub.`,
    headline: "Kết nối tri thức. Phát triển kỹ năng số.",
    introduction: org.description || `Không gian học tập trực tuyến dành cho học viên ${org.name}. Truy cập khóa học, tài liệu và tiếp tục hành trình học tập của bạn tại một nơi.`,
    highlights: [
      { title: "Học tập trực tuyến", description: "Truy cập các khóa học được cấp quyền bằng tài khoản của bạn." },
      { title: "Tài liệu học tập", description: "Theo dõi nội dung bài học và tài liệu trong từng khóa học." },
      { title: "Theo dõi tiến độ", description: "Tiếp tục bài học và xem lại quá trình học tập trên hệ thống." },
    ],
  };
});
