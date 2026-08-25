import { Metadata } from "next";
import { Hero, About, Activities, Projects, Members, HpcNotice } from "@/components/home";
import ScrollReset from "@/components/common/ScrollReset";

export const metadata: Metadata = {
  title: "BDC Hub | Big Data Club - HCMUT",
  description: "Trang thông tin chính thức của Big Data Club - Câu lạc bộ học thuật chuyên sâu về Big Data, AI, Cloud Computing tại Đại học Bách Khoa TP.HCM.",
  keywords: ["Big Data Club", "BDC", "HCMUT", "AI", "Machine Learning", "Cloud Computing", "Học thuật", "Bách Khoa"],
  openGraph: {
    title: "BDC Hub | Big Data Club - HCMUT",
    description: "Think Big - Speak Data. Khám phá cộng đồng học thuật chuyên sâu về Dữ liệu lớn và Trí tuệ nhân tạo.",
    url: "https://bdc.hpcc.vn",
    siteName: "BDC Hub",
    locale: "vi_VN",
    type: "website",
  },
};

export default function LandingPage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Big Data Club - HCMUT",
    "alternateName": "BDC",
    "url": "https://bdc.hpcc.vn",
    "logo": "https://bdc.hpcc.vn/og-image.png",
    "description": "Câu lạc bộ học thuật chuyên sâu về Big Data, AI, Cloud Computing tại Trường Đại học Bách Khoa - ĐHQG TP.HCM.",
    "parentOrganization": {
      "@type": "CollegeOrUniversity",
      "name": "Trường Đại học Bách Khoa - ĐHQG TP.HCM",
      "url": "https://hcmut.edu.vn"
    }
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <ScrollReset />
      <HpcNotice />

      {/* Chapter 1: The Gateway - Hero & Stats */}
      <div className="relative bg-slate-50 dark:bg-gradient-to-b dark:from-[#030712] dark:via-[#050b18] dark:to-[#070e1c]">
        <Hero />
      </div>

      {/* Chapter 2: The Foundation - About & Core Values */}
      <div className="relative bg-white dark:bg-[#060c18] border-t border-slate-200/80 dark:border-blue-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-blue-900/10 via-transparent to-transparent pointer-events-none" />
        <About />
      </div>

      {/* Chapter 3: The Engine - Core Activities */}
      <div className="relative bg-slate-100/70 dark:bg-[#0a1526] border-t border-slate-200/80 dark:border-blue-500/10">
        <Activities />
      </div>

      {/* Chapter 4: The Impact - Projects & Scientific Publications */}
      <div className="relative bg-white dark:bg-[#050b18] border-t border-slate-200/80 dark:border-blue-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-cyan-500/5 dark:from-cyan-950/15 via-transparent to-transparent pointer-events-none" />
        <Projects />
      </div>

      {/* Chapter 5: The People - Advisory Board & Mentors */}
      <div className="relative bg-slate-100/80 dark:bg-[#070e1c] border-t border-slate-200/80 dark:border-blue-500/10 pb-12">
        <Members />
      </div>
    </div>
  );
}