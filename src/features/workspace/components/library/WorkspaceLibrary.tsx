"use client";
import Link from "next/link";
import { ArrowLeft, BookOpen, LibraryBig, Plus, RotateCcw } from "lucide-react";
import type { WorkspaceBootstrap } from "../../types";
import {
  useLibraryBootstrap,
  useWorkspaceLibrary,
} from "../../hooks/useWorkspaceLibrary";
import { useLibraryCreate } from "../../hooks/useLibraryCreate";
import {
  WorkspaceButton,
  WorkspaceErrorBanner,
  WorkspaceLoading,
} from "../WorkspacePrimitives";
import { LibraryControls } from "./LibraryControls";
import { LibraryTable } from "./LibraryTable";
import { LibraryCreateDialog } from "./LibraryCreateDialog";
import styles from "./WorkspaceLibrary.module.css";
export function WorkspaceLibrary() {
  const data = useLibraryBootstrap();
  if (!data.bootstrap)
    return (
      <div className={styles.library}>
        <WorkspaceErrorBanner
          message={data.error}
          retry={() => void data.refresh()}
        />
        {!data.error && <WorkspaceLoading label="Đang mở Thư viện…" />}
      </div>
    );
  return (
    <LibraryContent key={data.bootstrap.user.id} bootstrap={data.bootstrap} />
  );
}
function LibraryContent({ bootstrap }: { bootstrap: WorkspaceBootstrap }) {
  const model = useWorkspaceLibrary(bootstrap.user.id),
    create = useLibraryCreate(bootstrap);
  return (
    <div className={styles.library}>
      <div className={styles.content}>
        <Link href="/workspace" className={styles.back}>
          <ArrowLeft size={15} />
          <span>Workspace</span>
        </Link>
        <header className={styles.header}>
          <div>
            <h1>Thư viện</h1>
            <p>Tất cả trang của bạn, trong một nơi.</p>
          </div>
          <WorkspaceButton
            className={styles.newButton}
            onClick={create.show}
            disabled={!create.spaces.length}
          >
            <Plus size={17} />
            Trang mới
          </WorkspaceButton>
        </header>
        <LibraryControls model={model} />
        <WorkspaceErrorBanner
          message={model.error}
          retry={() => void model.refresh()}
        />
        {model.items.length > 0 ? (
          <LibraryTable model={model} />
        ) : model.loading ? (
          <WorkspaceLoading label="Đang mở danh sách trang…" />
        ) : (
          !model.error && (
            <div className={styles.empty}>
              <LibraryBig size={34} />
              <h2>
                {model.query || model.preferences.filters.length
                  ? "Chưa có trang phù hợp"
                  : model.tab === "recent"
                    ? "Những trang bạn mở sẽ ở đây"
                    : model.tab === "favorites"
                      ? "Giữ những trang quan trọng ở gần"
                      : "Thư viện còn trống"}
              </h2>
              <p>
                {model.query || model.preferences.filters.length
                  ? "Thử tên khác hoặc điều chỉnh bộ lọc để tìm trang bạn cần."
                  : model.tab === "favorites"
                    ? "Đánh dấu ngôi sao bên cạnh tên trang để thêm vào Yêu thích."
                    : "Mở các trang hiện có hoặc tạo một trang mới để bắt đầu."}
              </p>
              <div>
                {model.query || model.preferences.filters.length ? (
                  <WorkspaceButton onClick={model.clear}>
                    <RotateCcw size={15} />
                    Xóa tìm kiếm & bộ lọc
                  </WorkspaceButton>
                ) : (
                  <WorkspaceButton onClick={() => model.setTab("all")}>
                    <BookOpen size={15} />
                    Xem tất cả trang
                  </WorkspaceButton>
                )}
              </div>
            </div>
          )
        )}
        {model.items.length > 0 && (
          <footer className={styles.footer}>
            <span>
              {new Intl.NumberFormat("vi-VN").format(model.total)} trang
              {model.items.length < model.total
                ? ` · Đã tải ${model.items.length}`
                : ""}
            </span>
            {model.nextOffset !== null && (
              <WorkspaceButton
                disabled={model.loading}
                onClick={() => void model.loadMore()}
              >
                {model.loading ? "Đang mở…" : "Xem thêm trang"}
              </WorkspaceButton>
            )}
          </footer>
        )}
      </div>
      {create.open && <LibraryCreateDialog model={create} />}
    </div>
  );
}
