"use client";

import type { SiteMenu, SitePage } from "../types";
import { Field, ListEditor, inputClass } from "./Fields";

export function NavigationEditor({ menu, onChange, pages, nested = false }: { menu: SiteMenu[]; onChange: (menu: SiteMenu[]) => void; pages: SitePage[]; nested?: boolean }) {
  return <ListEditor label={nested ? "Mục con" : "Mục menu"} max={12} items={menu} onChange={onChange} create={() => ({ label: "Mục mới", href: "/", children: [] })} render={(item, change) => <>
    <Field label="Tên hiển thị" value={item.label} onChange={label => change({ ...item, label })} />
    <label className="block text-sm">Chọn nhanh đích đến<select className={inputClass} value="" onChange={e => { if (e.target.value) change({ ...item, href: e.target.value }); }}><option value="">Chọn trang hoặc dịch vụ…</option><option value="/">Trang chủ</option>{pages.map(page => <option key={page.slug} value={`/thong-tin/${page.slug}`}>{page.title}</option>)}{["lms", "chat", "knowledge-farm", "labs"].map(root => <option key={root} value={`/${root}`}>{root}</option>)}</select></label>
    <Field label="Đường dẫn (/thong-tin/slug, /lms, hoặc https://...)" value={item.href} onChange={href => change({ ...item, href })} />
    {!nested && <NavigationEditor nested menu={item.children} onChange={children => change({ ...item, children })} pages={pages} />}
  </>} />;
}
