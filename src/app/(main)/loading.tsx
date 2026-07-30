export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse" aria-label="Đang chuyển trang">
      <div className="h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
      </div>
    </div>
  );
}
