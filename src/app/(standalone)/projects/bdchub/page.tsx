import type { Metadata } from "next";
import { BdcHubLanding } from "@/features/bdchub-project/BdcHubLanding";

export const metadata: Metadata = {
  title: "BDC Hub: Học tập, kiến thức và AI trong một không gian",
  description:
    "Khám phá BDC Hub qua demo tương tác: quản lý khóa học, knowledge graph và AI Cowork. Một dự án của Big Data Club.",
  alternates: { canonical: "/projects/bdchub" },
  openGraph: {
    title: "BDC Hub: Kiến thức có kết nối. Việc học có bạn đồng hành.",
    description:
      "Thử demo khóa học, knowledge graph và chat AI ngay trên trình duyệt, không cần đăng nhập.",
    url: "/projects/bdchub",
    locale: "vi_VN",
    type: "website",
  },
};

export default function BdcHubProjectPage() {
  return <BdcHubLanding />;
}
