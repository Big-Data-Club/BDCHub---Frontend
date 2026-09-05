"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef, ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { UserProvider, useUser } from "@/store/UserContext";
import { NotificationProvider } from "@/store/NotificationContext";
import { PageContextProvider } from "@/hooks/common/usePageContext";
import { CoworkerLayout } from "@/components/layout/CoworkerLayout";
import { logout } from "@/services/auth/logout";
import { userService } from "@/services/auth/userService";

function SessionMonitor() {
  const { data: session, status } = useSession();
  const { user, setUser } = useUser();
  const fetchedRef = useRef<number | string | null>(null);

  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
      logout();
      return;
    }
    
    if (status === "authenticated" && session?.user) {
      const sessionUserId = (session.user as any).id;
      const sessionProfilePicture = (session.user as any).profilePicture || (session.user as any).image;

      if (!user || user.id !== sessionUserId) {
        setUser({
          id: sessionUserId,
          name: session.user.name as string,
          email: session.user.email as string,
          role: (session.user as any).role as string,
          profilePicture: sessionProfilePicture || user?.profilePicture,
        });
      }

      if (sessionUserId && fetchedRef.current !== sessionUserId) {
        fetchedRef.current = sessionUserId;
        userService.getById(sessionUserId)
          .then((userData) => {
            if (userData) {
              setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                team: userData.team,
                type: userData.type,
                code: userData.code,
                profilePicture: userData.profilePicture || sessionProfilePicture,
              });
            }
          })
          .catch((err) => {
            console.error("Failed to fetch full user profile:", err);
          });
      }
    } else if (status === "unauthenticated") {
       fetchedRef.current = null;
       if (user) setUser(null);
     }
  }, [session, status, user?.id, setUser]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <SessionProvider refetchInterval={5 * 60}>
        <SessionMonitor />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="bdc-theme"
        >
          <PageContextProvider>
            <NotificationProvider>
              <CoworkerLayout>
                {children}
              </CoworkerLayout>
            </NotificationProvider>
          </PageContextProvider>
          <Toaster />
        </ThemeProvider>
      </SessionProvider>
    </UserProvider>
  );
}