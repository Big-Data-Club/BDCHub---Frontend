import { Metadata } from "next";
import { HomeLanding } from "@/components/home/editorial/HomeLanding";
import ScrollReset from "@/components/common/ScrollReset";

export const metadata: Metadata = {
  title: "BDC Hub | Big Data Club HCMUT",
  description: "Trang thông tin chính thức của Big Data Club, câu lạc bộ học thuật chuyên sâu về Big Data, High Performance Computing, Artificial Intelligence, Quantum Computing và Cloud Computing tại Đại học Bách Khoa TP.HCM.",
  keywords: ["Big Data Club", "BDC", "HCMUT", "AI", "Machine Learning", "Cloud Computing", "High Performance Computing", "Quantum Computing", "Học thuật", "Bách Khoa"],
  openGraph: {
    title: "BDC Hub | Big Data Club HCMUT",
    description: "Think Big. Speak Data. Khám phá cộng đồng học thuật chuyên sâu về Dữ liệu lớn và Trí tuệ nhân tạo.",
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
    "name": "Big Data Club HCMUT",
    "alternateName": "BDC",
    "url": "https://bdc.hpcc.vn",
    "logo": "https://bdc.hpcc.vn/og-image.png",
    "description": "Câu lạc bộ học thuật chuyên sâu về Big Data, High Performance Computing, AI, Quantum Computing và Cloud Computing tại HCMUT, dưới sự hướng dẫn của HPC Lab.",
    "parentOrganization": {
      "@type": "ResearchOrganization",
      "name": "HPC Lab",
      "url": "https://hpcc.hcmut.edu.vn/",
      "parentOrganization": {
        "@type": "CollegeOrUniversity",
        "name": "Trường Đại học Bách Khoa, ĐHQG TP.HCM",
        "url": "https://hcmut.edu.vn"
      }
    }
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <ScrollReset />

      <HomeLanding />
    </div>
  );
}
