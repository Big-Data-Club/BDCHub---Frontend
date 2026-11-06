"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";

export const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-500/20 dark:bg-lms-card dark:text-slate-100";
export const buttonClass =
  "rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 active:scale-95 disabled:opacity-40 dark:border-blue-500/20 dark:bg-lms-card dark:text-slate-200 dark:hover:bg-blue-950";

export function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
      {label}
      {multiline ? (
        <textarea
          className={inputClass}
          rows={5}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputClass}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        checked={value}
        onChange={e => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

const sampleOrg = `:::org-chart
## Ban Giám Đốc
- **PGS TS. Thoại Nam** - Giám đốc
  - Email: nam@cse.hcmut.edu.vn
  - Website: www.cse.hcmut.edu.vn/~nam

## Ban Phó Giám Đốc
- **TS. Dương Ngọc Hiếu** - Phó giám đốc
  - Email: dnhieu@hcmut.edu.vn
  - Chuyên môn: Chuyên ngành công nghệ thông tin
- **ThS. Lê Quốc Tuấn** - Phó giám đốc
  - Email: lqtuan@hcmut.edu.vn
  - Chuyên môn: Chuyên ngành công nghệ thông tin
- **ThS. Ngô Quang Nhựt** - Phó giám đốc
  - Điện thoại: 0813 23 04 33
  - Email: nhutnq@hcmut.edu.vn
  - Chuyên môn: Chuyên ngành công nghệ thông tin

## Phòng Kế toán & Hành chính
- **CN. Trần Thị Ngọc Diễm** - Kế toán trưởng
  - Điện thoại: 01666444566
  - Email: ngocdiemkt28@gmail.com
:::`;

export function RichTextField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function insert(before: string, after = "") {
    const start = ref.current?.selectionStart || 0;
    const end = ref.current?.selectionEnd || start;
    const selected = value.slice(start, end) || "Nội dung";
    onChange(value.slice(0, start) + before + selected + after + value.slice(end));
    ref.current?.focus();
  }

  function toggleOrgChartTag() {
    const start = ref.current?.selectionStart || 0;
    const end = ref.current?.selectionEnd || start;
    const selected = value.slice(start, end);

    if (selected.trim()) {
      // Wrap selected in :::org-chart
      const wrapped = `:::org-chart\n## Cấp lãnh đạo\n${selected}\n:::`;
      onChange(value.slice(0, start) + wrapped + value.slice(end));
    } else {
      // Append complete sample template
      onChange(value ? `${value}\n\n${sampleOrg}` : sampleOrg);
    }
    ref.current?.focus();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Nội dung bài viết (Hỗ trợ Markdown)
        </span>
        <button
          type="button"
          onClick={toggleOrgChartTag}
          className="rounded-lg border border-sky-400 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 shadow-xs transition-colors hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
          title="Đánh dấu khối hiển thị thành Sơ đồ tổ chức dạng Cây (Org Tree)"
        >
          🌳 Đánh dấu Sơ đồ tổ chức (:::org-chart)
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-900/60">
        {[
          ["Đậm", "**", "**"],
          ["Nghiêng", "*", "*"],
          ["Tiêu đề 2", "\n## ", "\n"],
          ["Tiêu đề 3", "\n### ", "\n"],
          ["Danh sách", "\n- ", "\n"],
          ["Đánh số", "\n1. ", "\n"],
          ["Ghi chú", "\n> ", "\n"],
          ["Bảng", "\n| Tiêu đề 1 | Tiêu đề 2 |\n|---|---|\n| Giá trị 1 | Giá trị 2 |\n", ""],
          ["Liên kết", "[", "](/lms)"],
        ].map(([label, before, after]) => (
          <button
            key={label}
            type="button"
            className={buttonClass}
            onClick={() => insert(before, after)}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        ref={ref}
        aria-label="Nội dung bài viết"
        className={inputClass}
        rows={8}
        value={value}
        onChange={event => onChange(event.target.value)}
      />

      <div className="rounded-xl border border-blue-500/20 bg-blue-50/60 p-3 text-xs text-blue-900 dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-200">
        <p className="font-semibold">💡 Hướng dẫn định dạng:</p>
        <ul className="mt-1 list-disc pl-4 space-y-1">
          <li>
            <strong>Sơ đồ tổ chức dạng cây:</strong> Bao quanh khối nhân sự bằng thẻ <code>:::org-chart</code> và <code>:::</code>. Đặt tên cấp/phòng ban tùy ý bằng đề mục <code>## Tên Nhóm</code> (Ví dụ: <code>## Ban Giám Đốc</code>, <code>## Phòng Đào Tạo</code>...). Hệ thống sẽ dựng cây theo đúng các nhóm bạn đặt.
          </li>
          <li>
            <strong>Tránh lỗi khối đen:</strong> Không lùi đầu dòng đoạn văn bằng 4 dấu cách hoặc phím Tab.
          </li>
          <li>Xem trước giao diện ngay tại tab <em>&ldquo;Xem trước&rdquo;</em> trước khi Xuất bản.</li>
        </ul>
      </div>
    </div>
  );
}

export function ImageField({
  value,
  onChange,
  upload,
}: {
  value: string;
  onChange: (url: string) => void;
  upload: (file: File) => Promise<string>;
}) {
  return (
    <div className="space-y-2">
      {value && (
        <Image
          src={value}
          alt="Xem trước ảnh"
          width={240}
          height={120}
          unoptimized
          className="max-h-32 rounded-xl border border-slate-200 object-contain dark:border-slate-700"
        />
      )}
      <Field label="URL ảnh" value={value} onChange={onChange} />
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        Tải ảnh PNG/JPG/WebP (tối đa 2 MB)
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
          onChange={e => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void upload(file).then(onChange).catch(() => undefined);
          }}
        />
      </label>
    </div>
  );
}

export function changeItem<T>(items: T[], index: number, value: T): T[] {
  return items.map((item, i) => (i === index ? value : item));
}

export function ListEditor<T>({
  items,
  onChange,
  render,
  create,
  label,
  max = 30,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, change: (item: T) => void, index: number) => ReactNode;
  create: () => T;
  label: string;
  max?: number;
}) {
  function move(index: number, delta: number) {
    const result = [...items];
    [result[index], result[index + delta]] = [result[index + delta], result[index]];
    onChange(result);
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-blue-500/20 dark:bg-lms-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <strong className="text-sm font-bold text-slate-900 dark:text-white">
              {label} {index + 1}
            </strong>
            <div className="flex gap-1.5">
              <button
                type="button"
                className={buttonClass}
                disabled={!index}
                onClick={() => move(index, -1)}
                aria-label={`Đưa ${label} ${index + 1} lên`}
              >
                ↑
              </button>
              <button
                type="button"
                className={buttonClass}
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
                aria-label={`Đưa ${label} ${index + 1} xuống`}
              >
                ↓
              </button>
              <button
                type="button"
                className={`${buttonClass} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                Xóa
              </button>
            </div>
          </div>
          {render(item, value => onChange(changeItem(items, index, value)), index)}
        </div>
      ))}
      <button
        type="button"
        className={`${buttonClass} border-dashed border-slate-300 py-3 text-center hover:border-blue-500 hover:text-blue-600`}
        disabled={items.length >= max}
        onClick={() => onChange([...items, create()])}
      >
        + Thêm {label.toLowerCase()}
      </button>
    </div>
  );
}
