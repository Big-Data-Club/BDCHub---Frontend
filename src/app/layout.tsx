// Trigger CI rebuild: chemistry virtual labs & LLM gateway updates
import 'devextreme/dist/css/dx.light.css';
import type { Metadata } from "next";
import { Nunito_Sans, Roboto_Mono, Comfortaa } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/MainProvider";

const comfortaa = Comfortaa({
  subsets: ["vietnamese"],
  variable: "--font-display",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bdc.hpcc.vn"),
  title: {
    default: "BDC Hub | Big Data Club - HCMUT",
    template: "%s | BDC Hub",
  },
  description: "Trang thông tin chính thức của Big Data Club - Câu lạc bộ học thuật chuyên sâu về Big Data, AI, Cloud Computing tại Đại học Bách Khoa TP.HCM.",
  keywords: ["Big Data Club", "BDC", "HCMUT", "AI", "Machine Learning", "Cloud Computing", "Dữ liệu lớn", "Bách Khoa", "HPCC"],
  authors: [{ name: "Big Data Club - HCMUT" }],
  creator: "Big Data Club Dev Team",
  publisher: "Big Data Club - HCMUT",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BDC Hub | Big Data Club - HCMUT",
    description: "Think Big - Speak Data. Khám phá cộng đồng học thuật chuyên sâu về Dữ liệu lớn và Trí tuệ nhân tạo.",
    url: "https://bdc.hpcc.vn",
    siteName: "BDC Hub",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Big Data Club - HCMUT",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BDC Hub | Big Data Club - HCMUT",
    description: "Khám phá cộng đồng học thuật chuyên sâu về Dữ liệu lớn và Trí tuệ nhân tạo tại HCMUT.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${comfortaa.variable} ${nunitoSans.variable} ${geistMono.variable} antialiased overflow-x-hidden no-scrollbar lms-fonts`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}