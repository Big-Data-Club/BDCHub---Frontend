export function siteHref(href: string, slug: string): string {
  if (!href || /[\\\x00-\x20]/.test(href) || href.startsWith("//")) return "#";
  if (href.startsWith("#")) return href;
  if (href.startsWith("/")) return href === "/" ? `/${slug}` : `/${slug}${href}`;
  try { const url = new URL(href); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? href : "#"; } catch { return "#"; }
}
