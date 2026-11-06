"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import type { SiteDocument, SiteSection } from "../types";
import { siteHref } from "../links";
import { normalizeMarkdown, parsePersonnel } from "../helpers";
import { OrgStructureView } from "./OrgStructureView";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs text-slate-300 backdrop-blur-xs transition-colors hover:bg-slate-700 hover:text-white"
      aria-label="Sao chép đoạn mã"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? "Đã chép" : "Sao chép"}</span>
    </button>
  );
}

function Content({ text, slug }: { text: string; slug: string }) {
  const normalized = normalizeMarkdown(text);
  const personnel = parsePersonnel(normalized);

  // If text is detected as personnel structure (or org list), render OrgStructureView
  if (personnel && personnel.length >= 2) {
    return <OrgStructureView members={personnel} />;
  }

  return (
    <div className="prose max-w-none text-slate-700 dark:prose-invert dark:text-slate-300">
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <Link
              href={siteHref(href || "", slug)}
              className="font-semibold text-[var(--tenant-primary)] underline decoration-[var(--tenant-primary)]/40 underline-offset-4 transition-colors hover:decoration-[var(--tenant-primary)]"
            >
              {children}
            </Link>
          ),
          img: () => null,
          h1: ({ children }) => (
            <h1 className="mb-4 mt-8 border-b border-slate-200/80 pb-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:border-slate-800 dark:text-white md:text-3xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 space-y-2 list-disc pl-6 marker:text-[var(--tenant-primary)]">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 space-y-2 list-decimal pl-6 marker:font-bold marker:text-[var(--tenant-primary)]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-base leading-relaxed text-slate-700 dark:text-slate-300">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-5 rounded-r-2xl border-l-4 border-[var(--tenant-primary)] bg-slate-50/80 py-3.5 pl-4 pr-5 italic text-slate-700 shadow-xs dark:bg-slate-800/40 dark:text-slate-300">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 shadow-xs dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">{children}</table>
              </div>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-bold uppercase tracking-wider text-slate-800 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-200">
              {children}
            </thead>
          ),
          th: ({ children }) => <th className="px-5 py-3.5">{children}</th>,
          td: ({ children }) => (
            <td className="border-t border-slate-100 px-5 py-3.5 dark:border-slate-800/60">{children}</td>
          ),
          pre: ({ children }) => {
            const codeString = String((children as unknown as { props?: { children?: unknown } })?.props?.children || "");
            return (
              <div className="group relative my-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-md">
                <CopyButton text={codeString} />
                <pre className="overflow-x-auto p-4 font-mono text-xs text-slate-200 md:text-sm">{children}</pre>
              </div>
            );
          },
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="rounded-md border border-slate-200/80 bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}

export function SiteSections({ sections, site, slug }: { sections: SiteSection[]; site: SiteDocument; slug: string }) {
  const isModern = site.template === "modern";

  return (
    <>
      {sections
        .filter(section => section.enabled)
        .map(section => (
          <section
            key={section.id}
            id={section.id}
            className={`scroll-mt-20 px-6 py-12 md:py-18 ${
              section.tone === "brand"
                ? isModern
                  ? "relative overflow-hidden bg-gradient-to-b from-[rgba(var(--tenant-primary-rgb),0.12)] to-transparent dark:from-[rgba(var(--tenant-primary-rgb),0.2)]"
                  : "border-y border-[var(--tenant-primary)]/20 bg-slate-50/70 dark:border-blue-500/15 dark:bg-lms-card"
                : section.tone === "muted"
                ? "bg-slate-50/80 dark:bg-slate-900/60"
                : "bg-white dark:bg-lms-bg"
            }`}
          >
            {/* Ambient modern glow on brand hero */}
            {section.tone === "brand" && isModern && (
              <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--tenant-primary)]/15 blur-3xl" />
            )}

            <div
              className={`relative mx-auto max-w-6xl space-y-8 ${
                section.align === "center" ? "text-center" : "text-left"
              }`}
            >
              {/* Hero pill badge */}
              {section.type === "hero" && (
                <div
                  className={`inline-flex items-center gap-2 rounded-full border border-[var(--tenant-primary)]/25 bg-[var(--tenant-primary)]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--tenant-primary)] shadow-xs ${
                    section.align === "center" ? "mx-auto" : ""
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Cổng thông tin & Học tập</span>
                </div>
              )}

              {/* Title */}
              {section.title && (
                <h2
                  className={`${
                    section.type === "hero"
                      ? "text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white"
                      : "text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white"
                  }`}
                >
                  {section.title}
                </h2>
              )}

              {/* Body */}
              {section.body && <Content text={section.body} slug={slug} />}

              {/* Hero / Banner Image */}
              {section.image && (
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 shadow-lg dark:border-slate-800">
                  <Image
                    src={section.image}
                    alt={section.title}
                    width={1200}
                    height={600}
                    unoptimized
                    className={`max-h-[32rem] w-full ${
                      section.type === "hero" ? "object-cover" : "object-contain bg-white dark:bg-slate-900"
                    }`}
                  />
                </div>
              )}

              {/* Cards Grid */}
              {section.type === "cards" && (
                <div className="grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((card, i) => (
                    <article
                      key={i}
                      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                    >
                      <div>
                        {card.image && (
                          <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
                            <Image
                              src={card.image}
                              alt={card.title}
                              width={600}
                              height={360}
                              unoptimized
                              className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-[var(--tenant-primary)] dark:text-white">
                          {card.title}
                        </h3>
                        {card.body && (
                          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                            <Content text={card.body} slug={slug} />
                          </div>
                        )}
                      </div>
                      {card.href && (
                        <div className="mt-5 pt-3">
                          <Link
                            href={siteHref(card.href, slug)}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--tenant-primary)] transition-transform group-hover:translate-x-1"
                          >
                            <span>Tìm hiểu thêm</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}

              {/* Contact Information */}
              {section.type === "contact" && (
                <div className="grid gap-6 text-left md:grid-cols-2">
                  <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thông tin liên hệ</h3>
                    <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                      {site.contact.hotline && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)]">
                            <Phone className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Hotline / Zalo</span>
                            <a
                              href={`tel:${site.contact.hotline.replace(/[^+0-9]/g, "")}`}
                              className="font-bold text-slate-900 hover:text-[var(--tenant-primary)] dark:text-white"
                            >
                              {site.contact.hotline}
                            </a>
                          </div>
                        </div>
                      )}
                      {site.contact.email && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Email</span>
                            <a
                              href={`mailto:${encodeURIComponent(site.contact.email)}`}
                              className="font-bold text-slate-900 hover:text-[var(--tenant-primary)] dark:text-white"
                            >
                              {site.contact.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {site.contact.address && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Địa chỉ</span>
                            <p className="whitespace-pre-line font-medium text-slate-800 dark:text-slate-200">
                              {site.contact.address}
                            </p>
                          </div>
                        </div>
                      )}
                      {site.contact.hours && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Giờ làm việc</span>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{site.contact.hours}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {site.contact.zaloUrl && (
                      <div className="pt-2">
                        <a
                          href={siteHref(site.contact.zaloUrl, slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95"
                        >
                          <span>Nhắn tin qua Zalo</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                  {site.contact.mapUrl && (
                    <a
                      href={siteHref(site.contact.mapUrl, slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/80 bg-slate-50 p-8 text-center font-semibold text-slate-700 shadow-xs transition-all hover:border-[var(--tenant-primary)] hover:bg-slate-100 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] transition-transform duration-300 group-hover:scale-110">
                        <MapPin className="h-7 w-7" />
                      </div>
                      <span className="text-base font-bold text-slate-900 dark:text-white">Xem vị trí trên bản đồ</span>
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--tenant-primary)] underline underline-offset-4">
                        Mở Google Maps <ExternalLink className="h-3 w-3" />
                      </span>
                    </a>
                  )}
                </div>
              )}

              {/* Section Button */}
              {section.buttonLabel && section.buttonHref && section.type !== "text" && (
                <div className={`pt-2 ${section.align === "center" ? "text-center" : "text-left"}`}>
                  <Link
                    href={siteHref(section.buttonHref, slug)}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--tenant-primary)] px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-110 hover:shadow-md active:scale-95"
                  >
                    <span>{section.buttonLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        ))}
    </>
  );
}
