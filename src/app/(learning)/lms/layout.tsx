import LmsContextShell from "./LmsContextShell";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { Nunito_Sans, Geist_Mono, Comfortaa } from "next/font/google";

const comfortaa = Comfortaa({
  subsets: ["vietnamese"],
  variable: "--font-display",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

type MainLayoutProps = {
  children: React.ReactNode;
};

export default async function MainLayout({ children }: MainLayoutProps) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).error === "RefreshAccessTokenError") {
    redirect("/login");
  }
  return (
    <div className={`flex min-h-screen w-full max-w-full flex-col bg-slate-50 dark:bg-lms-bg ${comfortaa.variable} ${nunitoSans.variable} ${geistMono.variable} lms-fonts`}>
      <LmsContextShell>
        {children}
      </LmsContextShell>
    </div>
  );
}
