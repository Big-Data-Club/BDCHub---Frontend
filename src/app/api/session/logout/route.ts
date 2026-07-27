import { NextResponse } from "next/server";

// NextAuth clears its own cookie during signOut.  This endpoint additionally
// expires legacy backend cookies that were set by /api/auth/login or Google
// login, so an old browser session cannot authenticate API calls after logout.
export async function POST() {
  const response = NextResponse.json({ ok: true });

  for (const name of [
    "authToken",
    "refreshToken",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "bdc.session-token.v2",
    "__Secure-bdc.session-token.v2",
  ]) {
    response.cookies.set({ name, value: "", path: "/", maxAge: 0 });
  }

  return response;
}
