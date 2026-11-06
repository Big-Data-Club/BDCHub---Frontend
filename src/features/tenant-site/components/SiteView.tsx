"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LogIn,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowUp,
  Globe,
} from "lucide-react";
import type { SiteBrand, SiteDocument, SitePage } from "../types";
import { siteHref } from "../links";
import { hexToRgb } from "../helpers";
import { SiteSlider } from "./SiteSlider";
import { SiteSections } from "./SiteSections";

export function SiteView({
  site,
  brand,
  page,
  preview = false,
}: {
  site: SiteDocument;
  brand: SiteBrand;
  page?: SitePage;
  preview?: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isModern = site.template === "modern";
  const primaryRgb = hexToRgb(site.primaryColor);

  const loginHref = `/${brand.slug}/login?callbackUrl=${encodeURIComponent(`/${brand.slug}/lms`)}`;

  return (
    <div
      lang="vi"
      style={
        {
          "--tenant-primary": site.primaryColor,
          "--tenant-primary-rgb": primaryRgb,
        } as CSSProperties
      }
      className={`min-h-screen bg-white text-slate-900 dark:bg-lms-bg dark:text-slate-100 ${
        isModern ? "selection:bg-[var(--tenant-primary)] selection:text-white" : ""
      }`}
      onClickCapture={event => {
        if (preview && (event.target as Element).closest("a")) event.preventDefault();
      }}
    >
      {preview && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 text-center text-xs font-bold text-amber-800 dark:text-amber-300">
          ⚠️ Bản xem trước — thay đổi chưa xuất bản ra website chính thức
        </div>
      )}

      <a href="#site-main" className="sr-only focus:not-sr-only">
        Đến nội dung chính
      </a>

      {/* 1. SLIM TOP MICRO-BAR (Only if tagline or hotline is provided) */}
      {(site.tagline || site.contact.hotline) && (
        <aside
          aria-label="Thông tin nhanh"
          className="border-b border-slate-200/60 bg-slate-50/70 px-4 py-1.5 text-xs text-slate-600 backdrop-blur-xs dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-400"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            {site.tagline ? (
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--tenant-primary)] shadow-[0_0_6px_var(--tenant-primary)]" />
                <span>{site.tagline}</span>
              </span>
            ) : (
              <span />
            )}
            {site.contact.hotline && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-[var(--tenant-primary)]" />
                <span>Hotline (Zalo):</span>
                <a
                  className="font-bold text-slate-900 hover:text-[var(--tenant-primary)] dark:text-slate-200"
                  href={`tel:${site.contact.hotline.replace(/[^+0-9]/g, "")}`}
                >
                  {site.contact.hotline}
                </a>
              </span>
            )}
          </div>
        </aside>
      )}

      {/* 2. COMPACT, SLEEK BIG TECH STICKY NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs transition-all duration-200 dark:border-slate-800/80 dark:bg-slate-900/85">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand Logo & Name */}
          <Link
            href={`/${brand.slug}`}
            className="group flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--tenant-primary)]"
          >
            {brand.logo && (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={42}
                height={42}
                unoptimized
                className="h-10 w-10 shrink-0 rounded-xl border border-slate-200/80 bg-white object-contain p-0.5 shadow-xs transition-transform duration-200 group-hover:scale-105 dark:border-slate-700/80"
              />
            )}
            <span className="line-clamp-1 max-w-[200px] text-base font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-[var(--tenant-primary)] sm:max-w-xs md:max-w-md md:text-lg dark:text-white">
              {brand.name}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">
            {site.menu.map((item, i) =>
              item.children.length ? (
                <div key={i} className="group relative">
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  {/* Floating glassmorphic dropdown popover */}
                  <div className="invisible pointer-events-none absolute left-0 top-full z-50 min-w-56 translate-y-1 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-xl opacity-0 backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-900/95">
                    <Link
                      href={siteHref(item.href, brand.slug)}
                      className="block rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100/80 hover:text-[var(--tenant-primary)] dark:text-slate-400 dark:hover:bg-slate-800/80"
                    >
                      {item.label} (Tổng quan)
                    </Link>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800/80" />
                    {item.children.map((child, j) => (
                      <Link
                        key={j}
                        href={siteHref(child.href, brand.slug)}
                        className="block rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100/80 hover:text-[var(--tenant-primary)] dark:text-slate-200 dark:hover:bg-slate-800/80"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={i}
                  href={siteHref(item.href, brand.slug)}
                  className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Action Button & Mobile Menu Trigger */}
          <div className="flex items-center gap-2.5">
            <Link
              href={loginHref}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--tenant-primary)] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:brightness-110 hover:shadow-md active:scale-95"
            >
              <span>Đăng nhập học tập</span>
              <LogIn className="h-4 w-4" />
            </Link>

            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 text-slate-700 hover:bg-slate-100 lg:hidden dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white/95 px-6 py-4 shadow-xl backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-slate-900/95">
            <div className="space-y-2">
              {site.menu.map((item, i) => (
                <div key={i} className="space-y-1">
                  <Link
                    href={siteHref(item.href, brand.slug)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 text-base font-bold text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
                  >
                    {item.label}
                  </Link>
                  {item.children.length > 0 && (
                    <div className="ml-4 space-y-1 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
                      {item.children.map((child, j) => (
                        <Link
                          key={j}
                          href={siteHref(child.href, brand.slug)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-[var(--tenant-primary)] dark:text-slate-300"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* 3. MAIN CONTENT */}
      <main id="site-main">
        {/* If on home page: Slider */}
        {!page && <SiteSlider site={site} slug={brand.slug} />}

        {/* If on detail page: Sleek Big Tech Page Hero Banner */}
        {page && (
          <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-[rgba(var(--tenant-primary-rgb),0.07)] to-transparent py-10 dark:border-slate-800/80 md:py-14">
            {/* Ambient subtle glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--tenant-primary)]/10 blur-3xl" />

            <div className="relative mx-auto max-w-6xl px-6">
              {/* Breadcrumb */}
              <nav aria-label="Đường dẫn trang" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Link
                  href={`/${brand.slug}`}
                  className="hover:text-[var(--tenant-primary)] transition-colors"
                >
                  Trang chủ
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span>Thông tin</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-900 dark:text-slate-200">{page.title}</span>
              </nav>

              {/* Title Header */}
              <div className="mt-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tenant-primary)]/20 bg-[var(--tenant-primary)]/10 px-3 py-0.5 text-xs font-bold text-[var(--tenant-primary)]">
                  <Sparkles className="h-3 w-3" />
                  <span>Cổng thông tin đơn vị</span>
                </div>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white">
                  {page.title}
                </h1>
              </div>
            </div>
          </section>
        )}

        {/* Sections */}
        <SiteSections sections={page?.sections || site.sections} site={site} slug={brand.slug} />
      </main>

      {/* 4. MODERN BIG TECH MULTI-COLUMN FOOTER */}
      <footer className="border-t border-slate-200/80 bg-slate-50/80 px-6 py-12 text-slate-700 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-300 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Column 1: Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {brand.logo && (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-9 w-9 rounded-xl border border-slate-200/80 bg-white object-contain p-0.5 dark:border-slate-700"
                  />
                )}
                <span className="font-extrabold text-slate-900 dark:text-white">{brand.name}</span>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {site.footerText || site.tagline}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Globe className="h-3 w-3 text-[var(--tenant-primary)]" />
                  <span>Vận hành trên nền tảng BDC Hub</span>
                </span>
              </div>
            </div>

            {/* Column 2: Direct Contact */}
            <div className="space-y-3 text-sm">
              <h4 className="font-bold text-slate-900 dark:text-white">Thông tin liên hệ</h4>
              {site.contact.address && (
                <p className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0 text-[var(--tenant-primary)] mt-0.5" />
                  <span className="whitespace-pre-line">{site.contact.address}</span>
                </p>
              )}
              {site.contact.email && (
                <p className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <Mail className="h-4 w-4 shrink-0 text-blue-500" />
                  <a href={`mailto:${site.contact.email}`} className="hover:underline">
                    {site.contact.email}
                  </a>
                </p>
              )}
              {site.contact.hotline && (
                <p className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <Phone className="h-4 w-4 shrink-0 text-emerald-500" />
                  <a href={`tel:${site.contact.hotline.replace(/[^+0-9]/g, "")}`} className="font-bold">
                    {site.contact.hotline}
                  </a>
                </p>
              )}
            </div>

            {/* Column 3: Quick Navigation */}
            <div className="space-y-3 text-sm">
              <h4 className="font-bold text-slate-900 dark:text-white">Liên kết nhanh</h4>
              <ul className="space-y-2">
                <li>
                  <Link href={`/${brand.slug}`} className="hover:text-[var(--tenant-primary)] transition-colors">
                    Trang chủ
                  </Link>
                </li>
                {site.pages.slice(0, 5).map(p => (
                  <li key={p.slug}>
                    <Link
                      href={`/${brand.slug}/thong-tin/${p.slug}`}
                      className="hover:text-[var(--tenant-primary)] transition-colors"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={loginHref} className="font-bold text-[var(--tenant-primary)] hover:underline">
                    Đăng nhập học tập trực tuyến →
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Strip */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <p>© {new Date().getFullYear()} {brand.name}. Tất cả các quyền được bảo lưu.</p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[var(--tenant-primary)] dark:text-slate-300"
            >
              <span>Lên đầu trang</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
