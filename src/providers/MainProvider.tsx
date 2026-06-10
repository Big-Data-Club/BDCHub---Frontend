"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect, ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { UserProvider, useUser } from "@/store/UserContext";
import { useTracker } from "@/hooks/useTracker";

function SessionMonitor() {
  const { data: session, status } = useSession();
  const { user, setUser } = useUser();

  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/login" });
      return;
    }
    
    if (status === "authenticated" && session?.user) {
      if (!user || user.id !== (session.user as any).id) {
        setUser({
          id: (session.user as any).id,
          name: session.user.name as string,
          email: session.user.email as string,
          role: (session.user as any).role as string,
        });
      }
    } else if (status === "unauthenticated") {
       if (user) setUser(null);
    }
  }, [session, status, user, setUser]);

  return null;
}

function TrackerMonitor() {
  const { user } = useUser();
  useTracker(user?.id);
  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <SessionProvider refetchInterval={5 * 60}>
        <SessionMonitor />
        <TrackerMonitor />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="bdc-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </SessionProvider>
    </UserProvider>
  );
}