export default function Loading() {
  return (
    <div className="space-y-5 p-5 sm:p-7 animate-pulse" aria-label="Đang chuyển trang">
      <div className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((item) => <div key={item} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
      </div>
    </div>
  );
}
