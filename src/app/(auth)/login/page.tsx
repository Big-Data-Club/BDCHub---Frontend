import React from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Logo } from "@/components/layout/Logo";
import Image from "next/image";
import Link from "@/lib/tenant/Link";
import { getTenantLanding } from "@/features/tenant-landing/registry";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ tenant?: string | string[] }> }) {
  const query = await searchParams;
  const slug = (await headers()).get("x-bdc-tenant") || query.tenant;
  const tenant = typeof slug === "string" ? await getTenantLanding(slug) : undefined;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  return (
    <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-row items-center justify-center gap-4">
        {tenant ? (
          tenant.logo && <Link href={`/${tenant.slug}`} aria-label={`Trang chủ ${tenant.name}`}>
            <Image src={tenant.logo} alt={tenant.name} width={80} height={80} priority className="rounded-full bg-white" />
          </Link>
        ) : <Logo />}
        <div className="flex flex-col items-start">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {tenant?.name || "BDC Hub"}
          </h2>
          <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-widest">
            {tenant ? "Cổng học tập trực tuyến" : "Think Big - Speak Data"}
          </p>
        </div>
      </div>

      <LoginForm googleClientId={googleClientId} organizationName={tenant?.name} />
    </div>
  );
}
