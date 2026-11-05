"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";

export const inputClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 dark:border-blue-500/20 dark:bg-lms-card dark:text-slate-100";
export const buttonClass = "rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 dark:border-blue-500/20";

export function Field({ label, value, onChange, multiline = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string }) {
  return <label className="block text-sm font-semibold">{label}{multiline ? <textarea className={inputClass} rows={5} value={value} onChange={e => onChange(e.target.value)} /> : <input className={inputClass} type={type} value={value} onChange={e => onChange(e.target.value)} />}</label>;
}
export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />{label}</label>;
}
export function RichTextField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  function insert(before: string, after = "") {
    const start = ref.current?.selectionStart || 0;
    const end = ref.current?.selectionEnd || start;
    onChange(value.slice(0, start) + before + (value.slice(start, end) || "Nội dung") + after + value.slice(end));
    ref.current?.focus();
  }
  return <div className="space-y-2"><span className="text-sm font-semibold">Nội dung bài viết</span><div className="flex flex-wrap gap-2">{[["Đậm", "**", "**"], ["Nghiêng", "*", "*"], ["Đề mục", "\n## ", "\n"], ["Danh sách", "\n- ", "\n"], ["Liên kết", "[", "](/lms)"]].map(([label, before, after]) => <button key={label} type="button" className={buttonClass} onClick={() => insert(before, after)}>{label}</button>)}</div><textarea ref={ref} aria-label="Nội dung bài viết" className={inputClass} rows={7} value={value} onChange={event => onChange(event.target.value)} /><p className="text-xs text-slate-500 dark:text-slate-400">Chọn đoạn chữ và dùng nút định dạng. Tab Xem trước hiển thị kết quả; HTML không được thực thi.</p></div>;
}
export function ImageField({ value, onChange, upload }: { value: string; onChange: (url: string) => void; upload: (file: File) => Promise<string> }) {
  return <div className="space-y-2">{value && <Image src={value} alt="Xem trước ảnh" width={240} height={120} unoptimized className="max-h-32 rounded-xl object-contain" />}
    <Field label="URL ảnh" value={value} onChange={onChange} />
    <label className="block text-sm">Tải ảnh PNG/JPG/WebP (tối đa 2 MB)<input type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block w-full text-sm" onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void upload(file).then(onChange).catch(() => undefined); }} /></label>
  </div>;
}
export function changeItem<T>(items: T[], index: number, value: T): T[] { return items.map((item, i) => i === index ? value : item); }
export function ListEditor<T>({ items, onChange, render, create, label, max = 30 }: { items: T[]; onChange: (items: T[]) => void; render: (item: T, change: (item: T) => void, index: number) => ReactNode; create: () => T; label: string; max?: number }) {
  function move(index: number, delta: number) { const result = [...items]; [result[index], result[index + delta]] = [result[index + delta], result[index]]; onChange(result); }
  return <div className="space-y-4">{items.map((item, index) => <div key={index} className="space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-blue-500/20">
    <div className="flex flex-wrap items-center justify-between gap-2"><strong>{label} {index + 1}</strong><div className="flex gap-2"><button type="button" className={buttonClass} disabled={!index} onClick={() => move(index, -1)} aria-label={`Đưa ${label} ${index + 1} lên`}>↑</button><button type="button" className={buttonClass} disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Đưa ${label} ${index + 1} xuống`}>↓</button><button type="button" className={buttonClass} onClick={() => onChange(items.filter((_, i) => i !== index))}>Xóa</button></div></div>
    {render(item, value => onChange(changeItem(items, index, value)), index)}
  </div>)}<button type="button" className={buttonClass} disabled={items.length >= max} onClick={() => onChange([...items, create()])}>+ Thêm {label.toLowerCase()}</button></div>;
}
