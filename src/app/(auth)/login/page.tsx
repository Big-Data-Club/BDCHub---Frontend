import React from "react";
import LoginForm from "@/components/login/LoginForm";
import { Logo } from "@/components/layout/Logo";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  return (
    <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-row items-center justify-center gap-4">
        <Logo />
        <div className="flex flex-col items-start">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            BDC Hub
          </h2>
          <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-widest">
            Think Big • Speak Data
          </p>
        </div>
      </div>

      <LoginForm googleClientId={googleClientId} />
    </div>
  );
}