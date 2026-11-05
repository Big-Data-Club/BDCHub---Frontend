"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import katex from "katex";
import "katex/contrib/mhchem";
import "katex/dist/katex.min.css";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  Plus,
  Search,
  X,
} from "lucide-react";
import { formulaCategories, formulaExamples } from "../data/formulas";
import type { FormulaInsert } from "../types";
import {
  WorkspaceButton,
  WorkspaceErrorBanner,
  workspaceInputClass,
} from "./WorkspacePrimitives";

export function WorkspaceGuide({
  onInsert,
  onClose,
}: {
  onInsert?: (value: FormulaInsert) => void;
  onClose?: () => void;
}) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [copied, setCopied] = useState(""),
    [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"inline" | "block">("block"),
    [practice, setPractice] = useState(String.raw`\frac{a+b}{c}`);
  const matches = useMemo(
    () =>
      formulaExamples.filter(
        (item) =>
          (category === "all" || item.category === category) &&
          `${item.title} ${item.source} ${item.hint}`
            .toLocaleLowerCase("vi")
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .includes(
              query
                .toLocaleLowerCase("vi")
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .trim(),
            ),
      ),
    [query, category],
  );
  const preview = (source: string) => {
    try {
      return {
        html: katex.renderToString(source, {
          displayMode: true,
          trust: false,
          strict: "error",
          throwOnError: true,
        }),
        error: null,
      };
    } catch {
      return {
        html: "",
        error:
          "Kiểm tra lệnh, dấu ngoặc và cặp begin/end. Mã bạn nhập vẫn được giữ.",
      };
    }
  };
  const practiceResult = preview(practice);
  async function copy(id: string, source: string) {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(id);
      setError(null);
    } catch {
      setError(
        "Chưa sao chép được. Bạn có thể chọn mã bên dưới để chép thủ công.",
      );
    }
  }
  const insert = (source: string) => {
    if (!onInsert) return;
    const rendered = preview(source);
    if (rendered.error) {
      setError(rendered.error);
      return;
    }
    onInsert({ source, mode });
  };
  return (
    <div className="min-w-0 bg-white text-slate-800 dark:bg-lms-bg dark:text-slate-200">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 dark:border-lms-border dark:bg-lms-shell">
        {onClose ? (
          <WorkspaceButton onClick={onClose}>
            <ArrowLeft className="size-4" />
            Về trang đang viết
          </WorkspaceButton>
        ) : (
          <Link
            href="/workspace"
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-cyan-400"
          >
            <ArrowLeft className="size-4" />
            Về Workspace
          </Link>
        )}
        <span className="flex items-center gap-2 text-sm">
          <BookOpen className="size-4" />
          Hướng dẫn editor & LaTeX
        </span>
        {onClose && (
          <WorkspaceButton onClick={onClose} aria-label="Đóng hướng dẫn">
            <X className="size-4" />
          </WorkspaceButton>
        )}
      </header>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:px-10">
        <nav
          aria-label="Mục lục hướng dẫn"
          className="flex flex-wrap gap-4 text-sm lg:sticky lg:top-24 lg:block lg:self-start lg:space-y-5"
        >
          {[
            ["start", "Bắt đầu"],
            ["blocks", "Viết bằng khối"],
            ["latex", "Công thức LaTeX"],
            ["library", "Thư viện công thức"],
            ["sync", "Lưu & chia sẻ"],
          ].map(([id, label]) => (
            <a
              key={id}
              className="block text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400"
              href={`#workspace-guide-${id}`}
            >
              {label}
            </a>
          ))}
        </nav>
        <main className="min-w-0 space-y-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
              Viết · Sắp xếp · Cộng tác
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Một nơi cho những ý tưởng rõ ràng.
            </h1>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Từ trang đầu tiên đến ghi chép có cấu trúc và công thức dễ đọc.
            </p>
          </div>
          <section
            id="workspace-guide-start"
            className="scroll-mt-24 space-y-4"
          >
            <h2 className="text-xl font-semibold">Bắt đầu với một trang</h2>
            <ol className="list-decimal space-y-3 pl-5 text-sm leading-7">
              <li>
                Chọn không gian cá nhân hoặc nhóm. Dùng Trang mới để tạo trang
                gốc, hoặc nút + của một trang để tạo trang con.
              </li>
              <li>
                Nhấp tiêu đề để đổi tên; menu trang có icon, cover, chiều rộng,
                nhân bản và thùng rác.
              </li>
              <li>
                Mở lại trang trong cây, Gần đây hoặc Yêu thích. Tìm kiếm chỉ trả
                nội dung bạn có quyền đọc.
              </li>
              <li>
                Bảng quản lý có nhiều cách xem trên cùng dữ liệu. Mở một hàng
                hoặc thẻ để viết thêm vào trang chi tiết.
              </li>
            </ol>
          </section>
          <section
            id="workspace-guide-blocks"
            className="scroll-mt-24 space-y-4"
          >
            <h2 className="text-xl font-semibold">Viết bằng các khối</h2>
            <p className="text-sm leading-7">
              Gõ / để tìm khối, dùng + để thêm và tay nắm sáu chấm để mở thao
              tác. Kéo tay nắm để sắp xếp. Bôi đen chữ để định dạng; Ctrl/Cmd+B
              để in đậm, Ctrl/Cmd+I để in nghiêng. Ctrl/Cmd+Z hoàn tác thao tác
              của bạn.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Tiêu đề & danh sách", "Chia nội dung thành các phần dễ đọc."],
                ["Code & bảng", "Lưu mã nguồn hoặc so sánh dữ liệu đơn giản."],
                [
                  "Trang con & liên kết",
                  "Trang con tổ chức cây; liên kết mở lại một trang đã có.",
                ],
                [
                  "Ảnh & tệp",
                  "Tải lên trang để người có quyền đọc trang truy cập.",
                ],
              ].map(([name, text]) => (
                <div
                  key={name}
                  className="rounded-xl bg-slate-50 p-4 dark:bg-lms-card"
                >
                  <h3 className="text-sm font-semibold">{name}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section
            id="workspace-guide-latex"
            className="scroll-mt-24 space-y-4"
          >
            <h2 className="text-xl font-semibold">
              LaTeX trong dòng hoặc riêng khối
            </h2>
            <p className="text-sm leading-7">
              Trong một câu, gõ{" "}
              <code className="rounded bg-slate-100 px-1 dark:bg-lms-card">
                {"$$E=mc^2$$"}
              </code>
              . Cặp dấu đóng hoàn chỉnh chuyển mã thành công thức. Dùng /math để
              tạo công thức riêng một khối; nhập mã thuần vào khối đó. Nhấp công
              thức để sửa.
            </p>
            <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
              Workspace dùng KaTeX cho công thức. Dùng aligned để canh nhiều
              dòng; đây là cú pháp công thức được hỗ trợ, với danh sách lệnh
              trong tài liệu KaTeX. Công thức tính giá trị trong bảng được cấu
              hình riêng tại thuộc tính Formula.
            </p>
            <label className="grid gap-2 text-sm font-medium">
              Thử một công thức
              <textarea
                aria-label="Mã LaTeX thử"
                className={`${workspaceInputClass} min-h-24 font-mono`}
                value={practice}
                onChange={(event) => setPractice(event.target.value)}
              />
            </label>
            {practiceResult.error ? (
              <p
                role="alert"
                className="text-sm text-rose-600 dark:text-rose-300"
              >
                {practiceResult.error}
              </p>
            ) : (
              <div
                className="overflow-x-auto rounded-xl bg-slate-50 p-6 dark:bg-lms-card"
                aria-label="Xem trước công thức"
                dangerouslySetInnerHTML={{ __html: practiceResult.html }}
              />
            )}
            <div className="flex flex-wrap items-center gap-3">
              <WorkspaceButton onClick={() => void copy("practice", practice)}>
                <Copy className="size-4" />
                Sao chép mã
              </WorkspaceButton>
              {onInsert && (
                <WorkspaceButton
                  onClick={() => insert(practice)}
                  disabled={Boolean(practiceResult.error)}
                >
                  <Plus className="size-4" />
                  Chèn vào trang
                </WorkspaceButton>
              )}
            </div>
          </section>
          <section
            id="workspace-guide-library"
            className="scroll-mt-24 space-y-5"
          >
            <h2 className="text-xl font-semibold">Thư viện công thức</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              65 ví dụ có mã, kết quả và gợi ý sử dụng. Tìm theo tên hoặc lệnh
              như frac, ma trận, attention.
            </p>
            <label className="flex items-center gap-3">
              <Search className="size-4 shrink-0 text-slate-400" />
              <input
                className={`${workspaceInputClass} w-full`}
                aria-label="Tìm công thức"
                placeholder="Tìm công thức hoặc lệnh…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-1" aria-label="Nhóm công thức">
              {[{ id: "all", label: "Tất cả" }, ...formulaCategories].map(
                (item) => (
                  <WorkspaceButton
                    key={item.id}
                    aria-pressed={category === item.id}
                    className={
                      category === item.id
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-cyan-300"
                        : ""
                    }
                    onClick={() => setCategory(item.id)}
                  >
                    {item.label}
                  </WorkspaceButton>
                ),
              )}
            </div>
            {onInsert && (
              <label className="flex flex-wrap items-center gap-3 text-sm">
                Cách chèn
                <select
                  className={workspaceInputClass}
                  value={mode}
                  onChange={(event) =>
                    setMode(event.target.value as "inline" | "block")
                  }
                >
                  <option value="block">Riêng một khối</option>
                  <option value="inline">Trong dòng đang viết</option>
                </select>
              </label>
            )}
            <WorkspaceErrorBanner message={error} />
            <p
              className="text-sm text-slate-500 dark:text-slate-400"
              role="status"
            >
              {matches.length} công thức{copied ? " · Đã sao chép mã" : ""}
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))] gap-4">
              {matches.map((item) => {
                const rendered = preview(item.source);
                return (
                  <article
                    key={item.id}
                    className="min-w-0 rounded-2xl border border-slate-200 p-4 dark:border-lms-border"
                  >
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <div
                      className="my-5 overflow-x-auto"
                      aria-label={`Công thức ${item.title}`}
                      dangerouslySetInnerHTML={{ __html: rendered.html }}
                    />
                    <pre className="overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs leading-6 dark:bg-lms-input">
                      <code>{item.source}</code>
                    </pre>
                    <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                      {item.hint}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <WorkspaceButton
                        onClick={() => void copy(item.id, item.source)}
                        aria-label={`Sao chép ${item.title}`}
                      >
                        {copied === item.id ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                        Sao chép
                      </WorkspaceButton>
                      {onInsert && (
                        <WorkspaceButton
                          onClick={() => insert(item.source)}
                          aria-label={`Chèn ${item.title}`}
                        >
                          <Plus className="size-4" />
                          Chèn
                        </WorkspaceButton>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
          <section id="workspace-guide-sync" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl font-semibold">
              Lưu và chia sẻ có kiểm soát
            </h2>
            <p className="text-sm leading-7">
              Đã lưu nghĩa là máy chủ đã xác nhận lưu nội dung. Khi mất kết nối,
              theo dõi trạng thái và bản nháp chưa đồng bộ. Nếu quyền hoặc phiên
              bản trang thay đổi, đọc thông báo trước khi tiếp tục. Cá nhân mặc
              định riêng tư; Share cho biết ai được đọc, bình luận, sửa hoặc
              quản lý.
            </p>
            <p className="text-sm leading-7">
              Gỡ một liên kết trang chỉ gỡ chỗ tham chiếu đó. Thao tác Đưa trang
              vào thùng rác được thực hiện từ menu trang, có thông báo phạm vi
              và cách khôi phục.
            </p>
            <a
              className="text-sm text-blue-600 dark:text-cyan-400"
              href="https://katex.org/docs/supported.html"
              target="_blank"
              rel="noreferrer"
            >
              Tra cứu cú pháp KaTeX được hỗ trợ
            </a>
          </section>
        </main>
      </div>
    </div>
  );
}
