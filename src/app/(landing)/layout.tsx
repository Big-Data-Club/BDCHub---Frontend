import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

type LandingLayoutProps = {
  children: React.ReactNode;
};

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="relative w-full min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col pt-20">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}