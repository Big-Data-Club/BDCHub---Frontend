"use client";
import { useEffect, useRef, useState } from "react";
import { ListTree } from "lucide-react";
import { contentText } from "../../utils/editorContent";
import type { WorkspaceEditorInstance } from "./schema";
import styles from "./EditorOutline.module.css";
export function EditorOutline({ editor }: { editor: WorkspaceEditorInstance }) {
  const [headings, setHeadings] = useState<
      { id: string; text: string; level: number; depth: number }[]
    >([]),
    [active, setActive] = useState(""),
    [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const read = () => {
      const items: typeof headings = [],
        levels: number[] = [];
      const visit = (blocks: typeof editor.document) => {
        for (const block of blocks) {
          if (block.type === "heading") {
            const text = contentText(block.content).trim(),
              level = block.props.level;
            if (text) {
              while (levels.length && levels[levels.length - 1] >= level)
                levels.pop();
              items.push({ id: block.id, text, level, depth: levels.length });
              levels.push(level);
            }
          }
          visit(block.children);
        }
      };
      visit(editor.document);
      setHeadings(items);
    };
    read();
    return editor.onChange(read);
  }, [editor]);
  useEffect(() => {
    const dom = editor.domElement,
      root = dom?.closest<HTMLElement>("[data-workspace-scroll]");
    if (!root || !dom || !headings.length) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = headings[0].id;
        const top = root.getBoundingClientRect().top + 120;
        for (const heading of headings) {
          const node = dom.querySelector(
            `[data-id="${CSS.escape(heading.id)}"]`,
          );
          if (node && node.getBoundingClientRect().top <= top)
            current = heading.id;
        }
        if (
          root.scrollTop > 0 &&
          root.scrollTop + root.clientHeight >= root.scrollHeight - 2
        )
          current = headings[headings.length - 1].id;
        setActive(current);
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(dom);
    root.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      root.removeEventListener("scroll", update);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [editor, headings]);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);
  if (!headings.length) return null;
  return (
    <nav
      ref={ref}
      aria-label="Mục lục trang"
      className={styles.outline}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label="Mở mục lục trang"
        aria-expanded={open}
        className={styles.trigger}
        onClick={() => setOpen(true)}
      >
        <ListTree className={styles.mobileIcon} size={18} />
        <span className={styles.bars} aria-hidden>
          {headings.map((heading) => (
            <i
              key={heading.id}
              style={{ width: Math.max(9, 25 - heading.depth * 6) }}
              data-active={active === heading.id}
            />
          ))}
        </span>
      </button>
      {open && (
        <div className={styles.panel}>
          <p>Mục lục</p>
          <div className={styles.entries}>
            {headings.map((heading) => (
              <button
                type="button"
                key={heading.id}
                style={{ paddingLeft: 12 + heading.depth * 16 }}
                title={heading.text}
                aria-current={heading.id === active ? "location" : undefined}
                onClick={() => {
                  const node = editor.domElement?.querySelector(
                      `[data-id="${CSS.escape(heading.id)}"]`,
                    ),
                    root = editor.domElement?.closest<HTMLElement>(
                      "[data-workspace-scroll]",
                    );
                  if (node && root)
                    root.scrollTo({
                      top:
                        root.scrollTop +
                        node.getBoundingClientRect().top -
                        root.getBoundingClientRect().top -
                        85,
                      behavior: matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                        ? "instant"
                        : "smooth",
                    });
                  setActive(heading.id);
                }}
              >
                {heading.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
