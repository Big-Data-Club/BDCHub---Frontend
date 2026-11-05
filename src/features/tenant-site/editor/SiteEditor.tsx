"use client";

import { useState } from "react";
import Link from "@/lib/tenant/Link";
import { useSiteEditor } from "../hooks/useSiteEditor";
import { defaultSite, newSection } from "../defaults";
import type { SiteBrand } from "../types";
import { SiteView } from "../components/SiteView";
import { SectionsEditor } from "./SectionsEditor";
import { NavigationEditor } from "./NavigationEditor";
import { Field, Toggle, ImageField, ListEditor, inputClass, buttonClass } from "./Fields";

const tabs = ["Nhận diện & liên hệ", "Slider", "Menu", "Trang chủ", "Trang thông tin", "Xem trước"];
export function SiteEditor({ orgId, brand }: { orgId: number; brand: SiteBrand }) {
  const editor = useSiteEditor(orgId, brand.name);
  const [tab, setTab] = useState(0);
  const [previewPage, setPreviewPage] = useState("");
  const site = editor.document;
  if (editor.loading) return <p role="status">Đang tải cấu hình website…</p>;
  if (!site) return <p role="alert">{editor.error || "Không thể tải cấu hình"}</p>;
  const change = editor.setDocument;
  return <div className="space-y-6 text-slate-900 dark:text-slate-100">
    <div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-2xl font-bold">Thiết kế website — {brand.name}</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{editor.dirty ? "Có thay đổi chưa lưu" : "Bản nháp đã đồng bộ"} · {editor.publishedAt ? `Đã xuất bản: ${new Date(editor.publishedAt).toLocaleString("vi-VN")}` : "Chưa xuất bản"}</p></div><Link href={`/${brand.slug}`} target="_blank" className={buttonClass}>Mở trang công khai ↗</Link></div>
    {editor.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-300">{editor.error}</p>}
    {editor.message && <p role="status" className="rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-950 dark:text-green-300">{editor.message}</p>}
    <div className="sticky top-16 z-20 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-blue-500/20 dark:bg-lms-card">
      <button type="button" className={buttonClass} disabled={editor.busy} onClick={() => void editor.run("save")}>Lưu nháp</button><button type="button" className={`${buttonClass} bg-blue-600 text-white`} disabled={editor.busy} onClick={() => void editor.run("publish")}>{editor.busy ? "Đang xử lý…" : "Xuất bản"}</button>
      {editor.publishedAt && <button type="button" className={buttonClass} disabled={editor.busy} onClick={() => { if (confirm("Gỡ website đã xuất bản? Trang sẽ quay về mẫu mặc định.")) void editor.run("unpublish"); }}>Gỡ xuất bản</button>}
      <button type="button" className={buttonClass} disabled={editor.busy} onClick={() => { if (confirm("Thay bản nháp bằng mẫu trung tâm đào tạo? Bản public không thay đổi cho đến khi xuất bản.")) change(defaultSite(brand.name, true)); }}>Nạp mẫu trung tâm đào tạo</button>
    </div>
    <div role="tablist" aria-label="Cấu hình website" className="flex flex-wrap gap-2">{tabs.map((label, i) => <button key={label} role="tab" aria-selected={tab === i} type="button" className={`${buttonClass} ${tab === i ? "bg-blue-600 text-white" : ""}`} onClick={() => setTab(i)}>{label}</button>)}</div>
    <fieldset disabled={editor.busy} className="space-y-6 disabled:opacity-60">
      {tab === 0 && <div className="grid gap-6 rounded-2xl border border-slate-200 p-6 dark:border-blue-500/20 md:grid-cols-2">
        <label>Mẫu giao diện<select className={inputClass} value={site.template} onChange={e => change({ ...site, template: e.target.value as "classic" | "modern" })}><option value="classic">Cổ điển — gọn gàng</option><option value="modern">Hiện đại — thoáng rộng</option></select></label>
        <Field label="Màu nhận diện" type="color" value={site.primaryColor} onChange={primaryColor => change({ ...site, primaryColor })} />
        <Field label="Khẩu hiệu / thanh thông tin" value={site.tagline} onChange={tagline => change({ ...site, tagline })} />
        <Field label="Nội dung chân trang" multiline value={site.footerText} onChange={footerText => change({ ...site, footerText })} />
        {([ ["hotline", "Hotline"], ["email", "Email"], ["address", "Địa chỉ (mỗi cơ sở một dòng)"], ["hours", "Giờ làm việc"], ["zaloUrl", "Liên kết Zalo (https://zalo.me/...)"], ["mapUrl", "Liên kết Google Maps"] ] as const).map(([key, label]) => <Field key={key} label={label} value={site.contact[key]} multiline={key === "address"} onChange={value => change({ ...site, contact: { ...site.contact, [key]: value } })} />)}
        <p className="text-sm text-slate-500 dark:text-slate-400">Tên và logo lấy từ cài đặt tổ chức. Mẫu chỉ là điểm bắt đầu; bạn có thể thay toàn bộ nội dung và bố cục.</p>
      </div>}
      {tab === 1 && <><Toggle label="Tự động chuyển ảnh" value={site.autoplay} onChange={autoplay => change({ ...site, autoplay })} /><label>Thời gian mỗi ảnh (3–30 giây)<input className={inputClass} type="number" min={3} max={30} value={site.slideInterval} onChange={e => change({ ...site, slideInterval: Number(e.target.value) })} /></label><ListEditor label="Slide" max={12} items={site.slides} onChange={slides => change({ ...site, slides })} create={() => ({ image: "", title: "", alt: "", href: "", enabled: true })} render={(slide, update) => <><Toggle label="Hiển thị slide" value={slide.enabled} onChange={enabled => update({ ...slide, enabled })} /><ImageField value={slide.image} onChange={image => update({ ...slide, image })} upload={editor.upload} /><Field label="Tiêu đề slide" value={slide.title} onChange={title => update({ ...slide, title })} /><Field label="Mô tả ảnh cho trình đọc màn hình" value={slide.alt} onChange={alt => update({ ...slide, alt })} /><Field label="Liên kết khi bấm ảnh (tùy chọn)" value={slide.href} onChange={href => update({ ...slide, href })} /></>} /></>}
      {tab === 2 && <NavigationEditor menu={site.menu} onChange={menu => change({ ...site, menu })} pages={site.pages} />}
      {tab === 3 && <SectionsEditor sections={site.sections} onChange={sections => change({ ...site, sections })} upload={editor.upload} />}
      {tab === 4 && <ListEditor label="Trang" items={site.pages} onChange={pages => change({ ...site, pages })} create={() => ({ slug: `trang-${site.pages.length + 1}`, title: "Trang mới", sections: [newSection()] })} render={(page, update) => <><Field label="Tên trang" value={page.title} onChange={title => update({ ...page, title })} /><Field label="Slug trang (a-z, 0-9, dấu -; cập nhật menu nếu đổi slug)" value={page.slug} onChange={slug => update({ ...page, slug })} /><SectionsEditor sections={page.sections} onChange={sections => update({ ...page, sections })} upload={editor.upload} /></>} />}
    </fieldset>
    {tab === 5 && <div className="space-y-4"><label>Trang xem trước<select className={inputClass} value={previewPage} onChange={e => setPreviewPage(e.target.value)}><option value="">Trang chủ</option>{site.pages.map(page => <option key={page.slug} value={page.slug}>{page.title}</option>)}</select></label><div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-blue-500/20"><SiteView site={site} brand={brand} page={site.pages.find(page => page.slug === previewPage)} preview /></div></div>}
  </div>;
}
