import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { SiteDocument, SiteSection } from "../types";
import { siteHref } from "../links";

function Content({ text, slug }: { text: string; slug: string }) {
  return <div className="prose max-w-none dark:prose-invert"><ReactMarkdown skipHtml components={{ a: ({ href, children }) => <Link href={siteHref(href || "", slug)}>{children}</Link>, img: () => null }}>{text}</ReactMarkdown></div>;
}

export function SiteSections({ sections, site, slug }: { sections: SiteSection[]; site: SiteDocument; slug: string }) {
  return <>{sections.filter(section => section.enabled).map(section => <section key={section.id} id={section.id} className={`scroll-mt-24 px-6 py-12 md:py-16 ${section.tone === "brand" ? "border-y-4 border-[var(--tenant-primary)] bg-slate-100 dark:bg-lms-card" : section.tone === "muted" ? "bg-slate-50 dark:bg-lms-card" : "bg-white dark:bg-lms-bg"}`}>
    <div className={`mx-auto max-w-6xl space-y-6 ${section.align === "center" ? "text-center" : "text-left"}`}>
      {section.title && <h2 className={`${section.type === "hero" ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"} font-bold tracking-tight`}>{section.title}</h2>}
      {section.body && <Content text={section.body} slug={slug} />}
      {section.image && <Image src={section.image} alt={section.title} width={1200} height={600} unoptimized className={`max-h-[32rem] w-full rounded-2xl ${section.type === "hero" ? "object-cover" : "object-contain"}`} />}
      {section.type === "cards" && <div className="grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">{section.items.map((card, i) => <article key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-blue-500/15 dark:bg-lms-card">
        {card.image && <Image src={card.image} alt={card.title} width={600} height={360} unoptimized className="aspect-[5/3] w-full object-cover" />}
        <div className="space-y-3 p-6"><h3 className="text-lg font-bold">{card.title}</h3><Content text={card.body} slug={slug} />{card.href && <Link href={siteHref(card.href, slug)} className="inline-block font-semibold underline underline-offset-4">Tìm hiểu thêm →</Link>}</div>
      </article>)}</div>}
      {section.type === "contact" && <div className="grid gap-6 text-left md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-200 p-6 dark:border-blue-500/15">
          {site.contact.hotline && <p><strong>Hotline:</strong> <a href={`tel:${site.contact.hotline.replace(/[^+0-9]/g, "")}`}>{site.contact.hotline}</a></p>}
          {site.contact.email && <p><strong>Email:</strong> <a href={`mailto:${encodeURIComponent(site.contact.email)}`}>{site.contact.email}</a></p>}
          <p className="whitespace-pre-line">{site.contact.address}</p><p>{site.contact.hours}</p>
          {site.contact.zaloUrl && <a href={siteHref(site.contact.zaloUrl, slug)} className="inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">Liên hệ Zalo</a>}
        </div>
        {site.contact.mapUrl && <a href={siteHref(site.contact.mapUrl, slug)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-2xl bg-slate-100 p-8 font-semibold underline dark:bg-lms-card">Xem vị trí trên bản đồ ↗</a>}
      </div>}
      {section.buttonLabel && section.buttonHref && section.type !== "text" && <Link href={siteHref(section.buttonHref, slug)} className="inline-flex rounded-xl bg-[var(--tenant-primary)] px-6 py-3 font-semibold text-white transition-all duration-200 active:scale-95">{section.buttonLabel} →</Link>}
    </div>
  </section>)}</>;
}
