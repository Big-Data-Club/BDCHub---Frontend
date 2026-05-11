"use client";

import { useEffect, useState, ReactNode } from "react";

export function MSWProvider({ children }: { children: ReactNode }) {
  // Nếu không ở môi trường dev hoặc không bật mock, coi như đã sẵn sàng ngay lập tức
  const isEnabled = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled";
  const [mswReady, setMswReady] = useState(!isEnabled);

  useEffect(() => {
    if (!isEnabled) return;

    const initMsw = async () => {
      if (typeof window !== "undefined") {
        const { worker } = await import("@/mocks/browser");
        try {
          await worker.start({
            onUnhandledRequest(req, print) {
              const url = req.url;
              // Block if it's a call to the real IP or the local proxy paths
              if (url.includes('103.70.13.93') || url.includes('/apiv1') || url.includes('/lmsapiv1')) {
                console.error(`🚨 [MSW SECURITY] Blocked unhandled request to backend: ${url}. Please add a mock handler for this endpoint.`);
                return;
              }
              // For other things (images, fonts, etc.), just warn
              print.warning();
            },
          });
          console.log("✅ MSW Mocking Enabled");
        } catch (error) {
          console.error("❌ MSW failed to start:", error);
        } finally {
          setMswReady(true);
        }
      }
    };

    initMsw();
  }, [isEnabled]);

  if (!mswReady) {
    return null; 
  }

  return <>{children}</>;
}
