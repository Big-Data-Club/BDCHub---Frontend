import { Metadata } from "next";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Activities from "@/components/home/Activities";
import Projects from "@/components/home/Projects";
// import Members from "@/components/home/Members";
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
  return (
    <div className="w-full pb-12">
      <ScrollReset />
      <Hero />
      <About />
      <Activities />
      <Projects />
      {/* <Members /> */}
    </div>
  );
}