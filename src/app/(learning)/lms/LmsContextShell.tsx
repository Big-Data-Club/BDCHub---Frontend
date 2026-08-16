"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import Sidebar from "@/components/layout/Sidebar";

export default function LmsContextShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Sub-dashboards (/lms/student, /lms/teacher, /lms/admin) have their own LmsHeader and workspace viewports.
  // Suppress global Footer on sub-dashboards to eliminate vertical clutter and maximize app workspace height.
  const isLmsSubDashboard = pathname.startsWith("/lms/") && pathname !== "/lms";

  return (
    <div className="flex flex-1 flex-col min-h-screen">
      <div className="flex flex-1">
        <div className="sticky top-0 h-screen flex-shrink-0 hidden md:block z-30">
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

      {!isLmsSubDashboard && <Footer />}
    </div>
  );
}
