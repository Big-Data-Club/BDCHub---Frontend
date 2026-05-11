import NextAuth from "next-auth/next";
import { authOptions } from "./authOptions";
import { server } from "@/mocks/server";

// Kích hoạt MSW trên Server đồng bộ để đảm bảo nó sẵn sàng trước khi request tới
if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
  server.listen({ 
    onUnhandledRequest(req) {
      const url = req.url;
      if (url.includes('103.70.13.93') || url.includes('/apiv1') || url.includes('/lmsapiv1')) {
        console.error(`🚨 [MSW SERVER SECURITY] Blocked unhandled request to backend: ${url}`);
        return;
      }
    } 
  });
  console.log("🖥️ [MSW Server] Mocking enabled on Next.js Server");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };