import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khảo Sát Đánh Giá Big Data Day 2026 | BDC Hub",
  description: "Khảo sát ý kiến đóng góp đánh giá sự kiện Big Data Day 2026 từ Big Data Club - Trường ĐH Bách khoa ĐHQG HCM.",
};

export default function BigDataDaySurveyRedirect() {
  redirect("/big-data-day-2026/survey");
}
