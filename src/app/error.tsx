"use client";

import React from "react";
import Link from "next/link";

type Props = {
  error: Error;
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  return (
    <>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-4">
          <span className="text-4xl">💥</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Ôi! Đã có lỗi xảy ra.</h1>
        <p className="text-slate-700 dark:text-slate-300 mb-4">Mô tả: {error?.message ?? "Không có thông tin lỗi"}</p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            onClick={() => {
              // cố gắng reset (Next sẽ gọi lại rendering tree)
              try {
                reset();
              } catch {
                // fallback: reload trang
                location.reload();
              }
            }}
            className="px-4 py-2 rounded-lg bg-yellow-400 text-white font-semibold hover:brightness-95 transition"
          >
            Thử lại
          </button>

          <Link href="/" className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Về Trang Chủ
          </Link>
        </div>

        <details className="mt-4 text-left text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          <summary className="cursor-pointer font-semibold text-slate-600 dark:text-slate-300">Chi tiết lỗi</summary>
          <pre className="whitespace-pre-wrap mt-2 text-[11px] bg-slate-100 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">{String(error?.stack ?? "Không có stack")}</pre>
        </details>

        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Nếu lỗi vẫn tiếp diễn, hãy gửi log cho team dev — họ sẽ cảm ơn bạn 😊</p>
    </>
  );
}
