import React, { useRef, useState } from "react";

export const inputCls =
  "w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 outline-none " +
  "bg-slate-50/50 dark:bg-slate-800/40 " +
  "border border-slate-200 dark:border-slate-700/60 " +
  "text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "focus:border-cyan-500 dark:focus:border-cyan-400 " +
  "focus:ring-4 focus:ring-cyan-500/10 dark:focus:ring-cyan-400/10 " +
  "focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]";

export const errInputCls = "border-red-400 dark:border-red-500/70 bg-red-50/50 dark:bg-red-950/10";

export function FL({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors duration-200">
      {children}{req && <span className="text-cyan-600 dark:text-cyan-400 ml-1 font-bold animate-pulse">*</span>}
    </label>
  );
}

export function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-fadeIn">⚠ {msg}</p>;
}

export function FIn({ error, suffix, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string; suffix?: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <input {...p} className={`${inputCls} ${error ? errInputCls : ""} ${suffix ? "pr-24" : ""}`} />
        {suffix && (
          <div className="absolute right-4 text-sm font-bold text-slate-400 dark:text-slate-500">
            {suffix}
          </div>
        )}
      </div>
      <Err msg={error} />
    </div>
  );
}

export function FTa({ error, rows = 3, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <div className="relative w-full">
      <textarea rows={rows} {...p} className={`${inputCls} resize-none ${error ? errInputCls : ""}`} />
      <Err msg={error} />
    </div>
  );
}

interface UploadZoneProps {
  url: string;
  filename: string;
  error?: string;
  onUploaded: (url: string, name: string) => void;
  onUploading: (uploading: boolean) => void;
  label?: string;
  hint?: string;
}

export function UploadZone({
  url,
  filename,
  error,
  onUploaded,
  onUploading,
  label = "Nộp minh chứng (PDF hoặc Ảnh)",
  hint = "Hỗ trợ định dạng: PDF, PNG, JPG, JPEG · Dung lượng tối đa: 10MB",
}: UploadZoneProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localErr, setLocalErr] = useState("");

  const handleFile = async (file: File) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setLocalErr("Chỉ chấp nhận file PDF hoặc hình ảnh (PNG, JPG, JPEG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLocalErr("File vượt quá dung lượng tối đa 10MB.");
      return;
    }

    setLocalErr("");
    setUploading(true);
    onUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload-evidence", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (json.success) {
        onUploaded(json.url, file.name);
      } else {
        setLocalErr(json.message || "Tải lên thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      setLocalErr("Không thể kết nối đến máy chủ để tải file.");
    } finally {
      setUploading(false);
      onUploading(false);
    }
  };

  return (
    <div className="mt-3 animate-fadeIn">
      <FL>{label}</FL>
      <div
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 transform active:scale-[0.99]
          ${(error || localErr)
            ? "border-red-400 dark:border-red-650 bg-red-50/20 dark:bg-red-950/10 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
            : url
              ? "border-emerald-400 dark:border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-cyan-50/10 dark:hover:bg-cyan-950/5"}`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {uploading ? (
          <div className="space-y-2 py-1">
            <div className="w-7 h-7 border-3 border-slate-200 dark:border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto" />
            <p className="text-cyan-600 dark:text-cyan-400 font-semibold text-xs animate-pulse">Đang tải minh chứng lên Cloudinary...</p>
          </div>
        ) : url ? (
          <div className="space-y-1.5 py-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-emerald-700 dark:text-emerald-400 font-bold text-xs max-w-md mx-auto truncate">{filename || "Minh_chung.pdf"}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Nhấp vào đây hoặc kéo thả file khác để thay thế</p>
          </div>
        ) : (
          <div className="space-y-1.5 py-1">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto transition-colors">
              <svg className="w-5 h-5 text-slate-450 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-350 text-xs font-semibold">
              Kéo thả file vào đây, hoặc <span className="text-cyan-600 dark:text-cyan-400 hover:underline">chọn file</span>
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-medium">{hint}</p>
          </div>
        )}
      </div>
      <Err msg={error || localErr} />
    </div>
  );
}
