"use client";

import type { SiteSection } from "../types";
import { newSection } from "../defaults";
import { Field, Toggle, ImageField, ListEditor, RichTextField, inputClass } from "./Fields";

export function SectionsEditor({ sections, onChange, upload }: { sections: SiteSection[]; onChange: (sections: SiteSection[]) => void; upload: (file: File) => Promise<string> }) {
  return <ListEditor items={sections} onChange={onChange} create={() => newSection()} label="Khối nội dung" render={(section, change) => <>
    <div className="grid gap-4 md:grid-cols-3">
      <label>Loại khối<select className={inputClass} value={section.type} onChange={e => change({ ...section, type: e.target.value as SiteSection["type"] })}>{[["hero", "Banner / giới thiệu"], ["text", "Bài viết"], ["cards", "Danh sách thẻ"], ["image", "Ảnh"], ["cta", "Kêu gọi hành động"], ["contact", "Thông tin liên hệ"]].map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label>Căn nội dung<select className={inputClass} value={section.align} onChange={e => change({ ...section, align: e.target.value as SiteSection["align"] })}><option value="left">Trái</option><option value="center">Giữa</option></select></label>
      <label>Nền khối<select className={inputClass} value={section.tone} onChange={e => change({ ...section, tone: e.target.value as SiteSection["tone"] })}><option value="plain">Trang</option><option value="muted">Tương phản nhẹ</option><option value="brand">Nhận diện</option></select></label>
    </div>
    <Toggle label="Hiển thị khối này" value={section.enabled} onChange={enabled => change({ ...section, enabled })} />
    <Field label="Tiêu đề" value={section.title} onChange={title => change({ ...section, title })} />
    <RichTextField value={section.body} onChange={body => change({ ...section, body })} />
    {["image", "hero"].includes(section.type) && <ImageField value={section.image} onChange={image => change({ ...section, image })} upload={upload} />}
    {["hero", "cta", "image", "cards"].includes(section.type) && <div className="grid gap-4 sm:grid-cols-2"><Field label="Nhãn nút (để trống để ẩn)" value={section.buttonLabel} onChange={buttonLabel => change({ ...section, buttonLabel })} /><Field label="Liên kết nút" value={section.buttonHref} onChange={buttonHref => change({ ...section, buttonHref })} /></div>}
    {section.type === "cards" && <ListEditor label="Thẻ" max={12} items={section.items} onChange={items => change({ ...section, items })} create={() => ({ title: "Thẻ mới", body: "", image: "", href: "" })} render={(card, update) => <><Field label="Tiêu đề thẻ" value={card.title} onChange={title => update({ ...card, title })} /><Field label="Nội dung thẻ" multiline value={card.body} onChange={body => update({ ...card, body })} /><ImageField value={card.image} onChange={image => update({ ...card, image })} upload={upload} /><Field label="Liên kết thẻ" value={card.href} onChange={href => update({ ...card, href })} /></>} />}
    {section.type === "contact" && <p className="text-sm text-slate-500 dark:text-slate-400">Khối này dùng dữ liệu ở tab Nhận diện & liên hệ.</p>}
  </>} />;
}
