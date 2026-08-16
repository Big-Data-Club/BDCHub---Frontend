import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12">
      <div className="max-w-3xl w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xl shadow-slate-200/60 dark:shadow-black/20 p-10 text-center backdrop-blur-sm">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-100 text-orange-600 mx-auto mb-6">
          <span className="text-4xl">😔</span>
        </div>

        <p className="text-sm text-orange-500 font-semibold uppercase tracking-[0.24em] mb-4">Trang chưa phát triển</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
          404 - Xin lỗi, trang này chưa có.
        </h1>
        <p className="mx-auto max-w-xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-8 mb-8">
          Có vẻ bạn vừa truy cập một trang chưa sẵn sàng. Hãy quay lại sau hoặc trở về trang chủ để tiếp tục khám phá.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-6 py-3 text-sm font-semibold transition hover:bg-slate-700"
          >
            Về trang chủ
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 px-6 py-3 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Thử trang khác
          </Link>
        </div>
      </div>
    </div>
  );
}
