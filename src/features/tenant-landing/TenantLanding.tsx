import Image from "next/image";
import Link from "next/link";
import type { TenantLandingConfig } from "./registry";

const actionClass = "inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 active:scale-95 transition-all duration-200";

export function TenantLanding({ tenant }: { tenant: TenantLandingConfig }) {
  return (
    <div lang="vi" className="min-h-screen bg-slate-50 text-slate-900 dark:bg-lms-bg dark:text-slate-100">
      <a href="#noi-dung" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-blue-700">
        Đến nội dung chính
      </a>
      <header className="border-b border-slate-200 bg-white dark:border-blue-500/10 dark:bg-lms-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-8">
          <Link href={`/${tenant.slug}`} className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-blue-500">
            <Image src={tenant.logo} alt={`Logo ${tenant.shortName}`} width={64} height={64} priority className="rounded-full bg-white" />
            <span className="max-w-56 text-base font-bold leading-snug sm:max-w-none">{tenant.name}</span>
          </Link>
          <Link href="/lms" className={actionClass}>Đăng nhập học tập</Link>
        </div>
      </header>

      <main id="noi-dung" className="mx-auto max-w-7xl px-6 lg:px-8">
        <section className="grid items-center gap-12 py-16 md:grid-cols-[1fr_auto] md:py-24" aria-labelledby="tenant-title">
          <div className="max-w-2xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-widest text-blue-700 dark:text-cyan-400">{tenant.name}</p>
            <h1 id="tenant-title" className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{tenant.headline}</h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{tenant.introduction}</p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link href="/lms" className={actionClass}>Vào hệ thống học tập <span aria-hidden="true" className="ml-3">→</span></Link>
              <a href="#gioi-thieu" className="rounded-xl font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-cyan-400">Tìm hiểu thêm</a>
            </div>
            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Sử dụng tài khoản BDC Hub để đăng nhập.</p>
          </div>
          <div className="hidden rounded-full border border-slate-200 bg-white p-8 md:block dark:border-blue-500/10">
            <Image src={tenant.logo} alt="" width={240} height={240} priority />
          </div>
        </section>

        <section id="gioi-thieu" className="scroll-mt-8 border-t border-slate-200 py-14 dark:border-blue-500/10" aria-labelledby="learning-title">
          <h2 id="learning-title" className="mb-8 text-2xl font-bold">Đồng hành cùng việc học của bạn</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {tenant.highlights.map((highlight, index) => (
              <article key={highlight.title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-blue-500/10 dark:bg-lms-card">
                <p aria-hidden="true" className="mb-6 text-sm font-bold text-blue-700 dark:text-cyan-400">0{index + 1}</p>
                <h3 className="text-lg font-bold">{highlight.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{highlight.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-6 py-8 text-sm text-slate-500 dark:border-blue-500/10 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4">
          <p>{tenant.name}</p>
          <Link href="/" className="rounded hover:underline focus-visible:outline-2 focus-visible:outline-blue-500">Nền tảng BDC Hub</Link>
        </div>
      </footer>
    </div>
  );
}
