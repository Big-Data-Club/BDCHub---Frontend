"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/store/UserContext";
import { NotificationProvider } from "@/store/NotificationContext";
import { PageContextProvider } from "@/hooks/common/usePageContext";
import { CoworkerLayout } from "@/components/layout/CoworkerLayout";
import { useSessionProfile } from "@/hooks/auth/useSessionProfile";

function SessionMonitor() {
  useSessionProfile();
  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      <UserProvider>
        <SessionMonitor />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="bdc-theme"
        >
          <PageContextProvider>
            <NotificationProvider>
              <CoworkerLayout>{children}</CoworkerLayout>
            </NotificationProvider>
          </PageContextProvider>
          <Toaster />
        </ThemeProvider>
      </UserProvider>
    </SessionProvider>
  );
}
