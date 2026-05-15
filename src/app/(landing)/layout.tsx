import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Background from "@/components/layout/Background";

type LandingLayoutProps = {
  children: React.ReactNode;
};

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="relative w-full min-h-screen bg-transparent text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40 selection:text-blue-900 dark:selection:text-blue-100">
      <Background />
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col pt-20">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}