import { getServerSession } from "next-auth";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export default async function BdcHubPublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session as { error?: string }).error === "RefreshAccessTokenError") {
    return children;
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="sticky top-0 hidden h-screen flex-shrink-0 md:block">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-40 md:hidden">
          <MobileNav />
        </div>
        {children}
      </div>
    </div>
  );
}
