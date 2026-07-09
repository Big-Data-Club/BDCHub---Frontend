import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import Sidebar from "@/components/layout/Sidebar";
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
  if (!session) {
    redirect("/");
  }
  return (
    <div className={`flex min-h-screen w-full max-w-full flex-col bg-slate-50 dark:bg-lms-bg ${comfortaa.variable} ${nunitoSans.variable} ${geistMono.variable} lms-fonts`}>
      <div className="flex flex-1">
        <div className="sticky top-0 h-screen flex-shrink-0 hidden md:block">
          <Sidebar />
        </div>

        <div className="flex flex-1 flex-col min-w-0">
          <div className="sticky top-0 z-40 md:hidden">
            <MobileNav />
          </div>
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}