"use client";
import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Download, Minus, Plus, RotateCcw } from "lucide-react";
import {
  WorkspaceButton,
  WorkspaceDialog,
  WorkspaceErrorBanner,
} from "../WorkspacePrimitives";
import { changeCrop, fullCrop, type CropRect } from "../../utils/imageCrop";
import styles from "./WorkspaceImage.module.css";

export function ImageCropDialog({
  url,
  name,
  onSave,
  onClose,
}: {
  url: string;
  name: string;
  onSave: (crop: CropRect) => Promise<void>;
  onClose: () => void;
}) {
  const [crop, setCrop] = useState(fullCrop),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const stage = useRef<HTMLDivElement>(null),
    drag = useRef<{
      x: number;
      y: number;
      rect: CropRect;
      handle: string;
    } | null>(null);
  const down = (event: PointerEvent, handle: string) => {
    if (busy) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, rect: crop, handle };
  };
  const move = (event: PointerEvent) => {
    if (!drag.current || !stage.current) return;
    const rect = stage.current.getBoundingClientRect(),
      start = drag.current;
    setCrop(
      changeCrop(
        start.rect,
        start.handle,
        (event.clientX - start.x) / rect.width,
        (event.clientY - start.y) / rect.height,
      ),
    );
  };
  return (
    <WorkspaceDialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
      title="Cắt ảnh"
      description="Kéo khung hoặc các cạnh để chọn vùng ảnh cần giữ."
      wide
    >
      <WorkspaceErrorBanner message={error} />
      <div className={styles.cropStage} ref={stage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name || "Ảnh cần cắt"} draggable={false} />
        <div
          className={styles.cropSelection}
          style={{
            left: `${crop.x * 100}%`,
            top: `${crop.y * 100}%`,
            width: `${crop.width * 100}%`,
            height: `${crop.height * 100}%`,
          }}
          onPointerDown={(event) => down(event, "move")}
          onPointerMove={move}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((handle) => (
            <button
              key={handle}
              type="button"
              className={styles.cropHandle}
              data-handle={handle}
              aria-label={`Cạnh cắt ${handle}`}
              disabled={busy}
              onPointerDown={(event) => down(event, handle)}
              onKeyDown={(event) => {
                const dx =
                    event.key === "ArrowLeft"
                      ? -0.01
                      : event.key === "ArrowRight"
                        ? 0.01
                        : 0,
                  dy =
                    event.key === "ArrowUp"
                      ? -0.01
                      : event.key === "ArrowDown"
                        ? 0.01
                        : 0;
                if (dx || dy) {
                  event.preventDefault();
                  setCrop(changeCrop(crop, handle, dx, dy));
                }
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <WorkspaceButton disabled={busy} onClick={() => setCrop(fullCrop)}>
          <RotateCcw size={15} />
          Đặt lại
        </WorkspaceButton>
        <div className="flex gap-2">
          <WorkspaceButton disabled={busy} onClick={onClose}>
            Hủy
          </WorkspaceButton>
          <WorkspaceButton
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await onSave(crop);
                onClose();
              } catch (reason) {
                setError(
                  reason instanceof Error
                    ? reason.message
                    : "Chưa cắt được ảnh.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Đang lưu…" : "Lưu ảnh đã cắt"}
          </WorkspaceButton>
        </div>
      </div>
    </WorkspaceDialog>
  );
}

export function ImageExpandDialog({
  url,
  name,
  caption,
  onClose,
}: {
  url: string;
  name: string;
  caption: string;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  return (
    <WorkspaceDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Xem ảnh"
      className="sm:max-w-[96vw]"
      description={name || "Phóng to để xem chi tiết ảnh."}
      wide
    >
      <div className={styles.lightbox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          style={{ width: `${zoom * 100}%`, maxWidth: "none" }}
        />
      </div>
      {caption && (
        <p className="text-center text-sm text-slate-500">{caption}</p>
      )}
      <div className="flex items-center justify-center gap-2">
        <WorkspaceButton
          aria-label="Thu nhỏ ảnh"
          disabled={zoom <= 0.25}
          onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
        >
          <Minus size={16} />
        </WorkspaceButton>
        <button
          type="button"
          aria-label="Vừa khung ảnh"
          onClick={() => setZoom(1)}
          className="min-w-14 text-sm"
        >
          {Math.round(zoom * 100)}%
        </button>
        <WorkspaceButton
          aria-label="Phóng to ảnh"
          disabled={zoom >= 4}
          onClick={() => setZoom(Math.min(4, zoom + 0.25))}
        >
          <Plus size={16} />
        </WorkspaceButton>
        <a
          href={url}
          download={name || "anh"}
          aria-label="Tải ảnh xuống"
          className="p-2"
        >
          <Download size={16} />
        </a>
      </div>
    </WorkspaceDialog>
  );
}
