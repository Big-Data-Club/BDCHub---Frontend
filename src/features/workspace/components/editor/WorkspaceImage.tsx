"use client";
import { useEffect, useRef, useState } from "react";
import { createImageBlockConfig, imageParse } from "@blocknote/core";
import { SideMenuExtension } from "@blocknote/core/extensions";
import {
  createReactBlockSpec,
  useEditorState,
  type ReactCustomBlockRenderProps,
} from "@blocknote/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Captions,
  Crop,
  Download,
  ImagePlus,
  Maximize2,
  Trash2,
} from "lucide-react";
import { useWorkspaceEditorContext } from "./EditorContext";
import { workspaceService } from "../../api/workspaceService";
import { cropImage } from "../../utils/imageCrop";
import { workspaceDragType } from "../../hooks/useBlockDrop";
import { ImageCropDialog, ImageExpandDialog } from "./ImageTools";
import styles from "./WorkspaceImage.module.css";

type ImageProps = ReactCustomBlockRenderProps<typeof createImageBlockConfig>;
function WorkspaceImage({ block, editor }: ImageProps) {
  const context = useWorkspaceEditorContext(),
    input = useRef<HTMLInputElement>(null),
    caption = useRef<HTMLTextAreaElement>(null),
    figure = useRef<HTMLElement>(null);
  const [tool, setTool] = useState<{
      type: "crop" | "expand";
      url: string;
      name: string;
    } | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [width, setWidth] = useState<number | undefined>(block.props.previewWidth);
  const editable = useEditorState({
    editor,
    selector: () => editor.isEditable,
  });
  const resize = useRef<{ x: number; width: number; direction: number } | null>(
    null,
  );
  useEffect(
    () => setWidth(block.props.previewWidth),
    [block.props.previewWidth],
  );
  useEffect(() => {
    if (caption.current) {
      caption.current.style.height = "0px";
      caption.current.style.height = `${caption.current.scrollHeight}px`;
    }
  }, [block.props.caption]);
  const update = (props: Partial<typeof block.props>) => {
    if (editor.isEditable && editor.getBlock(block.id))
      editor.updateBlock(block, { props });
  };
  const assertCurrent = () => {
    const current = editor.getBlock(block.id);
    if (
      !editor.isEditable ||
      current?.type !== "image" ||
      current.props.url !== block.props.url
    )
      throw Error(
        "Ảnh hoặc quyền chỉnh sửa vừa thay đổi. Mở lại công cụ rồi thử lại.",
      );
  };
  const tools = [
    {
      label: "Chú thích ảnh",
      icon: Captions,
      run: () => caption.current?.focus(),
    },
    {
      label: "Cắt ảnh",
      icon: Crop,
      run: () =>
        setTool({ type: "crop", url: block.props.url, name: block.props.name }),
    },
    {
      label: "Mở rộng ảnh",
      icon: Maximize2,
      run: () =>
        setTool({
          type: "expand",
          url: block.props.url,
          name: block.props.name,
        }),
      readonly: true,
    },
    { label: "Thay ảnh", icon: ImagePlus, run: () => input.current?.click() },
    {
      label: "Căn trái ảnh",
      icon: AlignLeft,
      run: () => update({ textAlignment: "left" }),
    },
    {
      label: "Căn giữa ảnh",
      icon: AlignCenter,
      run: () => update({ textAlignment: "center" }),
    },
    {
      label: "Căn phải ảnh",
      icon: AlignRight,
      run: () => update({ textAlignment: "right" }),
    },
    {
      label: "Xóa ảnh",
      icon: Trash2,
      run: () => {
        if (editor.isEditable) editor.removeBlocks([block.id]);
      },
    },
  ];
  return (
    <figure
      ref={figure}
      className={styles.figure}
      contentEditable={false}
      data-align={block.props.textAlignment}
      style={{ width: width ? `${width}px` : "100%" }}
    >
      {block.props.url ? (
        <div
          className={styles.frame}
          draggable={editable}
          onPointerDown={(event) =>
            context?.onBlockPointerDown(event, { blockId: block.id })
          }
          onDragStartCapture={(event) => {
            if ((event.target as Element).closest("button,textarea,a")) {
              event.preventDefault();
              return;
            }
            event.stopPropagation();
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData(
              workspaceDragType,
              JSON.stringify({ blockId: block.id }),
            );
          }}
          onDragEnd={() =>
            editor.getExtension(SideMenuExtension)?.blockDragEnd()
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="bn-visual-media"
            src={block.props.url}
            alt={block.props.name}
            draggable={false}
            onDoubleClick={() =>
              setTool({
                type: "expand",
                url: block.props.url,
                name: block.props.name,
              })
            }
          />
          <div
            className={styles.tools}
            role="toolbar"
            aria-label="Công cụ ảnh"
            onDragStart={(event) => event.preventDefault()}
          >
            {tools
              .filter((item) => editable || item.readonly)
              .map(({ label, icon: Icon, run }) => (
                <button
                  key={label}
                  type="button"
                  title={label}
                  aria-label={label}
                  disabled={busy}
                  onClick={run}
                >
                  <Icon size={16} />
                </button>
              ))}
            <a
              href={block.props.url}
              download={block.props.name || "anh"}
              title="Tải ảnh xuống"
              aria-label="Tải ảnh xuống"
            >
              <Download size={16} />
            </a>
          </div>
          {editable &&
            [-1, 1].map((direction) => (
              <button
                type="button"
                key={direction}
                className={styles.resize}
                data-side={direction}
                aria-label={
                  direction === -1
                    ? "Đổi chiều rộng ảnh bên trái"
                    : "Đổi chiều rộng ảnh bên phải"
                }
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  resize.current = {
                    x: event.clientX,
                    width: figure.current!.getBoundingClientRect().width,
                    direction,
                  };
                }}
                onPointerMove={(event) => {
                  if (!resize.current) return;
                  const start = resize.current,
                    max = figure.current?.parentElement?.clientWidth || 1000;
                  setWidth(
                    Math.min(
                      max,
                      Math.max(
                        80,
                        start.width +
                          (event.clientX - start.x) *
                            start.direction *
                            (block.props.textAlignment === "center" ? 2 : 1),
                      ),
                    ),
                  );
                }}
                onPointerUp={() => {
                  if (resize.current) {
                    resize.current = null;
                    update({ previewWidth: width });
                  }
                }}
                onPointerCancel={() => {
                  resize.current = null;
                  setWidth(block.props.previewWidth);
                }}
              />
            ))}
        </div>
      ) : (
        editable && (
          <button
            type="button"
            className={styles.empty}
            onClick={() => input.current?.click()}
          >
            <ImagePlus size={20} />
            Thêm ảnh
          </button>
        )
      )}
      {editable && (
        <input
          ref={input}
          type="file"
          className="sr-only"
          aria-label="Tải ảnh lên"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file || !context) return;
            setBusy(true);
            setError("");
            try {
              if (
                !["image/png", "image/jpeg", "image/webp"].includes(
                  file.type,
                ) ||
                file.size > 10 * 1024 * 1024
              )
                throw Error("Chọn ảnh PNG, JPEG hoặc WebP không quá 10 MB.");
              const result = await workspaceService.upload(
                context.page.id,
                file,
              );
              assertCurrent();
              update({ url: result.url, name: result.name, showPreview: true });
            } catch (reason) {
              setError(
                reason instanceof Error ? reason.message : "Chưa tải được ảnh.",
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
      {block.props.url &&
        (editable ? (
          <textarea
            ref={caption}
            aria-label="Chú thích ảnh"
            placeholder="Thêm chú thích…"
            className={styles.caption}
            rows={1}
            maxLength={4000}
            value={block.props.caption}
            onChange={(event) => update({ caption: event.target.value })}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Escape") event.currentTarget.blur();
            }}
            onPaste={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          />
        ) : (
          block.props.caption && (
            <figcaption className={styles.caption}>
              {block.props.caption}
            </figcaption>
          )
        ))}
      {busy && (
        <p role="status" className={styles.caption}>
          Đang tải ảnh…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-rose-500">
          {error}
        </p>
      )}
      {tool?.type === "expand" && (
        <ImageExpandDialog
          url={tool.url}
          name={tool.name}
          caption={block.props.caption}
          onClose={() => setTool(null)}
        />
      )}
      {tool?.type === "crop" && (
        <ImageCropDialog
          url={tool.url}
          name={tool.name}
          onClose={() => setTool(null)}
          onSave={async (crop) => {
            if (!context) return;
            assertCurrent();
            if (editor.getBlock(block.id)?.props.url !== tool.url)
              throw Error("Ảnh vừa thay đổi. Mở lại công cụ cắt ảnh.");
            const file = await cropImage(tool.url, crop, tool.name);
            assertCurrent();
            const result = await workspaceService.upload(context.page.id, file);
            if (editor.getBlock(block.id)?.props.url !== tool.url)
              throw Error("Ảnh vừa thay đổi. Mở lại công cụ cắt ảnh.");
            assertCurrent();
            update({ url: result.url, name: result.name });
          }}
        />
      )}
    </figure>
  );
}
export const workspaceImage = createReactBlockSpec(
  createImageBlockConfig,
  (config) => ({
    meta: { fileBlockAccept: ["image/*"] },
    render: WorkspaceImage,
    parse: imageParse(config),
    runsBefore: ["file"],
    toExternalHTML: ({ block }) => (
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.props.url}
          alt={block.props.name}
          width={block.props.previewWidth}
        />
        {block.props.caption && <figcaption>{block.props.caption}</figcaption>}
      </figure>
    ),
  }),
)();
