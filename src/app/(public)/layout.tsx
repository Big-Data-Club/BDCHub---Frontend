import Footer from "@/components/layout/Footer";

type PublicLayoutProps = {
  children: React.ReactNode;
};

/**
 * Layout for public token-based pages (password confirmation, reset).
 * No session guard - these pages must be accessible regardless of auth state.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans transition-colors dark:bg-[#050b18] dark:text-slate-100">
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      <Footer />
    </div>
  );
}
