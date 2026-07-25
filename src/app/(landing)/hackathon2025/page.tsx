import { Metadata } from "next";
import EventPageClient from "./client-page";

export const metadata: Metadata = {
  title: "BDC Data Hackathon 2025",
  description: "Cuộc thi lập trình Hackathon thường niên được tổ chức bởi Big Data Club - Đại học Bách Khoa TP.HCM. Cơ hội thử thách bản thân với các bài toán Big Data và AI thực tế.",
  keywords: ["Hackathon 2025", "BDC Hackathon", "Big Data", "AI contest", "Bách Khoa Hackathon"],
  alternates: {
    canonical: "/hackathon2025",
  },
  openGraph: {
    title: "BDC Data Hackathon 2025 | Big Data Club - HCMUT",
    description: "Thử thách giới hạn công nghệ với các bài toán dữ liệu lớn và học máy tại BDC Hackathon 2025.",
    url: "https://bdc.hpcc.vn/hackathon2025",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BDC Data Hackathon 2025",
      },
    ],
  },
};

export default function EventPage() {
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "BDC Data Hackathon 2025",
    "description": "Cuộc thi lập trình Hackathon thường niên tổ chức bởi Big Data Club - HCMUT.",
    "startDate": "2025-10-30T08:00:00+07:00",
    "endDate": "2025-11-23T18:00:00+07:00",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "Trường Đại học Bách Khoa - ĐHQG TP.HCM",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "268 Lý Thường Kiệt, Phường 14, Quận 10",
        "addressLocality": "Thành phố Hồ Chí Minh",
        "addressCountry": "VN"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "Big Data Club - HCMUT",
      "url": "https://bdc.hpcc.vn"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <EventPageClient />
    </>
  );
}