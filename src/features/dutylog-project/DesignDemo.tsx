"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { dutylogLinks } from "./content";
import styles from "./dutylog.module.css";

const PhoneDemo = dynamic(
  () => import("./PhoneDemo").then((module) => module.PhoneDemo),
  {
    loading: () => <p>Đang mở ứng dụng mẫu…</p>,
  },
);

export function DesignDemo() {
  const [view, setView] = useState<"design" | "app">("design");
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={styles.designDemo} id="demo">
      <div
        className={styles.designModes}
        role="group"
        aria-label="Chọn bản xem DutyLog"
      >
        <button
          type="button"
          aria-pressed={view === "design"}
          onClick={() => setView("design")}
        >
          Thiết kế Figma
        </button>
        <button
          type="button"
          aria-pressed={view === "app"}
          onClick={() => setView("app")}
        >
          Ứng dụng mẫu
        </button>
      </div>
      {view === "design" ? (
        <>
          <div className={styles.designFrame}>
            {loaded ? (
              <iframe
                src={dutylogLinks.figmaEmbed}
                title="Thiết kế DutyLog trên Figma"
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className={styles.designPlaceholder}>
                <p>DutyLog</p>
                <h2>Khám phá thiết kế.</h2>
                <p>Xem các màn hình và luồng sử dụng trên Figma.</p>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => setLoaded(true)}
                >
                  Tải bản thiết kế
                </button>
              </div>
            )}
          </div>
          <a
            href={dutylogLinks.figma}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.designExternal}
          >
            Mở trực tiếp trên Figma
          </a>
        </>
      ) : (
        <PhoneDemo id="sample-demo" />
      )}
    </div>
  );
}
