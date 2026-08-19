import Footer from "@/components/layout/Footer";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { AuthShell } from "@/components/auth/AuthShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: "noindex, nofollow",
};


type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);
  // A legacy/expired NextAuth cookie can still deserialize to a session while
  // its backend token can no longer be refreshed or is missing. Let the login page render
  // so SessionMonitor can clear it instead of redirecting back to /lms.
  if (session && (session as any).error !== "RefreshAccessTokenError" && (session as any).accessToken) {
    redirect("/lms");
  }

  return (
    <AuthShell>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col relative z-10">
        {children}
      </main>

      <Footer />
    </AuthShell>
  );
}
