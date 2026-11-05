"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { validateOrganizationLogo } from "@/services/admin/organizationService";

type Props = {
  value: string;
  file: File | null;
  onChange: (url: string, file: File | null) => void;
  disabled?: boolean;
};

export function OrganizationLogoInput({ value, file, onChange, disabled }: Props) {
  const id = useId();
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const image = preview || value;
  const showImage = image && (image.startsWith("blob:") || /^https?:\/\//.test(image) || (image.startsWith("/") && !image.startsWith("//")));

  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Logo tổ chức</label>
      {showImage && <Image src={image} alt="Xem trước logo tổ chức" width={80} height={80} unoptimized className="h-20 w-20 rounded-xl border border-slate-200 bg-white object-contain p-1 dark:border-slate-700" />}
      <input id={id} type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled}
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
        className="block w-full rounded-xl text-sm text-slate-700 dark:text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white disabled:opacity-50"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          event.target.value = "";
          if (!selected) return;
          try {
            validateOrganizationLogo(selected);
            setError("");
            onChange(value, selected);
          } catch (err) { setError(err instanceof Error ? err.message : "Ảnh không hợp lệ"); }
        }}
      />
      <p id={`${id}-help`} className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG hoặc WebP, tối đa 2 MB. Ảnh được tải lên khi bấm Tạo/Lưu.</p>
      {file && <p className="break-all text-xs text-slate-600 dark:text-slate-300">Đã chọn: {file.name}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <details>
        <summary className="cursor-pointer text-xs text-slate-600 dark:text-slate-400">Hoặc dùng URL ảnh có sẵn</summary>
        <input aria-label="Logo URL" value={value} disabled={disabled} placeholder="https://example.com/logo.png"
          onChange={event => { setError(""); onChange(event.target.value, null); }}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" />
      </details>
      {(file || value) && <button type="button" disabled={disabled} onClick={() => { setError(""); onChange("", null); }} className="rounded-xl text-xs font-semibold text-red-600 transition-all duration-200 active:scale-95 disabled:opacity-50 dark:text-red-400">Bỏ logo</button>}
    </div>
  );
}
