"use client";
import { Check, Palette, X } from "lucide-react";
import { useState } from "react";
import { workspaceService } from "../api/workspaceService";
import type { WorkspacePage, FieldColor } from "../types";
import { FieldArtwork, colorLabels } from "./fields/FieldArtwork";
import { workspaceInputClass } from "./WorkspacePrimitives";
const emojis = [
  "",
  "📖",
  "📝",
  "💡",
  "🎯",
  "🔬",
  "📊",
  "∑",
  "⚛",
  "🧬",
  "✦",
  "🧭",
  "🧩",
  "🚀",
  "💻",
  "🎨",
];
export function PageAppearanceFields({
  icon,
  cover,
  pageId,
  coverImage,
  onCoverImage,
  onUploading,
  full,
  onIcon,
  onCover,
  onFull,
}: {
  icon: string;
  cover: WorkspacePage["cover"];
  pageId: string;
  coverImage: string | null;
  onCoverImage: (value: string | null) => void;
  onUploading: (value: boolean) => void;
  full: boolean;
  onIcon: (value: string) => void;
  onCover: (value: WorkspacePage["cover"]) => void;
  onFull: (value: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Palette className="size-4" />
          Biểu tượng trang
        </legend>
        <div className="grid grid-cols-8 gap-2">
          {emojis.map((value) => (
            <button
              type="button"
              key={value}
              aria-label={value ? `Chọn biểu tượng ${value}` : "Bỏ biểu tượng"}
              aria-pressed={icon === value}
              onClick={() => onIcon(value)}
              className={`grid size-9 place-items-center rounded-xl border text-xl ${icon === value ? "border-blue-400 bg-blue-50 dark:bg-blue-500/15" : "border-slate-200 hover:bg-slate-50 dark:border-lms-border dark:hover:bg-lms-hover"}`}
            >
              {value || <X className="size-4 text-slate-400" />}
            </button>
          ))}
        </div>
        <label className="mt-3 grid gap-1 text-xs text-slate-500">
          Hoặc nhập emoji của bạn
          <input
            aria-label="Icon trang"
            maxLength={20}
            className={`${workspaceInputClass} max-w-40`}
            value={icon}
            onChange={(event) => onIcon(event.target.value)}
          />
        </label>
      </fieldset>
      <fieldset disabled={uploading}>
        <legend className="mb-3 text-sm font-semibold">Ảnh bìa</legend>
        <label className="mb-3 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 p-4 text-sm dark:border-lms-border">
          {uploading
            ? "Đang tải ảnh…"
            : "Tải ảnh bìa lên · PNG, JPEG, WebP · tối đa 10 MB"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            aria-label="Tải ảnh bìa lên"
            disabled={uploading}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              if (
                !["image/png", "image/jpeg", "image/webp"].includes(
                  file.type,
                ) ||
                file.size > 10 * 1024 * 1024
              ) {
                setError("Chọn ảnh PNG, JPEG hoặc WebP không quá 10 MB.");
                return;
              }
              setUploading(true);
              onUploading(true);
              setError("");
              try {
                const uploaded = await workspaceService.upload(pageId, file);
                onCoverImage(uploaded.id);
              } catch (reason) {
                setError(
                  reason instanceof Error
                    ? reason.message
                    : "Chưa tải được ảnh bìa.",
                );
              } finally {
                setUploading(false);
                onUploading(false);
              }
            }}
          />
        </label>
        {error && (
          <p role="alert" className="mb-3 text-sm text-rose-500">
            {error}
          </p>
        )}
        {coverImage && (
          <div className="mb-3 space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/workspace/files/${coverImage}`}
              alt="Xem trước ảnh bìa"
              className="h-32 w-full rounded-xl object-cover"
            />
            <button
              type="button"
              className="text-sm text-rose-500"
              onClick={() => onCoverImage(null)}
            >
              Bỏ ảnh đã tải lên
            </button>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            aria-label="Bỏ ảnh bìa"
            aria-pressed={!cover && !coverImage}
            onClick={() => onCover("")}
            className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border text-xs text-slate-500 ${!cover ? "border-blue-500" : "border-slate-200 dark:border-lms-border"}`}
          >
            <X className="size-4" />
            Không bìa
          </button>
          {(Object.keys(colorLabels) as FieldColor[]).map((color) => (
            <button
              type="button"
              key={color}
              aria-label={`Ảnh bìa ${colorLabels[color]}`}
              aria-pressed={cover === color && !coverImage}
              className={`relative overflow-hidden rounded-xl border-2 text-xs ${cover === color && !coverImage ? "border-blue-500" : "border-transparent"}`}
              onClick={() => onCover(color)}
            >
              <div className="[&>div]:min-h-20 [&_svg]:size-10">
                <FieldArtwork icon="sparkles" color={color} compact />
              </div>
              {cover === color && !coverImage && (
                <Check className="absolute right-2 top-2 size-4 text-blue-600" />
              )}
              <span className="block bg-white py-1.5 text-slate-500 dark:bg-lms-input dark:text-slate-300">
                {colorLabels[color]}
              </span>
            </button>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-lms-input">
        <input
          type="checkbox"
          aria-label="Toàn chiều rộng"
          className="size-4 accent-blue-600"
          checked={full}
          onChange={(event) => onFull(event.target.checked)}
        />
        <span>
          Mở rộng toàn chiều ngang
          <p className="mt-1 text-xs text-slate-500">
            Phù hợp cho bảng dữ liệu và tài liệu nhiều cột.
          </p>
        </span>
      </label>
    </div>
  );
}
