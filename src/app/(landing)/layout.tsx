import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Background from "@/components/layout/Background";
import ScrollToTop from "@/components/common/ScrollToTop";

type LandingLayoutProps = {
  children: React.ReactNode;
};

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="relative isolate w-full min-h-screen bg-transparent text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-600 selection:text-white dark:selection:bg-cyan-500 dark:selection:text-slate-950">
      <Background />
      <Navbar />
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col pt-20">
          {children}
        </main>
        <Footer />
      </div>
      <ScrollToTop />
    </div>
  );
}
