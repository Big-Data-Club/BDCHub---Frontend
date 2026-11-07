export type SiteCard = { title: string; body: string; image: string; href: string };
export type SiteSection = {
  id: string; type: "hero" | "text" | "cards" | "image" | "cta" | "contact";
  enabled: boolean; title: string; body: string; image: string;
  buttonLabel: string; buttonHref: string; align: "left" | "center";
  tone: "plain" | "muted" | "brand"; items: SiteCard[];
};
export type SiteMenu = { label: string; href: string; children: SiteMenu[] };
export type SitePage = { slug: string; title: string; sections: SiteSection[] };
export type SiteDocument = {
  schemaVersion: 1; template: "classic" | "modern"; primaryColor: string; tagline: string; footerText: string;
  contact: { hotline: string; email: string; address: string; hours: string; zaloUrl: string; mapUrl: string };
  slides: { image: string; title: string; alt: string; href: string; enabled: boolean }[];
  slideInterval: number; autoplay: boolean; menu: SiteMenu[]; sections: SiteSection[]; pages: SitePage[];
};
export type SiteEditorState = { revision: number; draft: SiteDocument | null; publishedAt: string | null };
export type SiteBrand = { slug: string; name: string; logo: string };
