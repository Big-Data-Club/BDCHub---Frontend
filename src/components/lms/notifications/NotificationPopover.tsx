"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, BookOpen, Sparkles, Inbox, Loader2 } from "lucide-react";
import { useNotifications } from "@/store/NotificationContext";
import { useRouter } from "@/lib/tenant/navigation";
import { notificationCategory, notificationKey, notificationHref, notificationTitle, notificationMessage, type StudyAlert } from "@/lib/notifications/model";
import { cn } from "@/lib/utils";

const tabs = [{ id: "all", label: "Tất cả" }, { id: "learning", label: "Học tập" }, { id: "suggestion", label: "Gợi ý" }] as const;
export function NotificationPopover() {
  const router = useRouter();
  const { alerts, readAlertKeys, unreadAlertsCount, fetchAlerts, markAlertAsRead, markAllAlertsAsRead, isLoading, error } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "learning" | "suggestion">("all");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (root.current && !root.current.contains(event.target as Node)) setIsOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && isOpen) { setIsOpen(false); trigger.current?.focus(); } };
    document.addEventListener("mousedown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, [isOpen]);
  const openNotice = (alert: StudyAlert) => { markAlertAsRead(alert); setIsOpen(false); router.push(notificationHref(alert)); };
  const filtered = alerts.filter(alert => activeTab === "all" || notificationCategory(alert) === activeTab);
  return <div className="relative" ref={root}>
    <button ref={trigger} type="button" onClick={() => { if (!isOpen) void fetchAlerts(); setIsOpen(!isOpen); }} aria-label={`Thông báo${unreadAlertsCount ? `, ${unreadAlertsCount} chưa đọc` : ""}`} aria-expanded={isOpen} aria-haspopup="dialog"
      className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:bg-[#162644]">
      <Bell className="h-5 w-5" />
      {unreadAlertsCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{unreadAlertsCount > 9 ? "9+" : unreadAlertsCount}</span>}
    </button>
    {isOpen && <div role="dialog" aria-label="Thông báo học tập và gợi ý" className="absolute right-0 z-[99] mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-blue-500/20 dark:bg-[#0F1E35]">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 p-4 dark:border-blue-500/10">
        <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Thông báo</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Cập nhật khóa học và hỗ trợ học tập</p></div>
        {unreadAlertsCount > 0 && <button type="button" onClick={markAllAlertsAsRead} className="flex min-h-9 items-center gap-1 text-xs font-semibold text-blue-700 dark:text-cyan-300"><CheckCheck className="h-4 w-4" />Đọc tất cả</button>}
      </div>
      <div className="mx-3 mt-3 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-[#0D192E]">
        {tabs.map(tab => {
          const count = alerts.filter(alert => (tab.id === "all" || notificationCategory(alert) === tab.id) && !readAlertKeys.has(notificationKey(alert))).length;
          return <button key={tab.id} type="button" aria-pressed={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={cn("min-h-10 flex-1 rounded-lg px-2 text-xs font-semibold transition-colors", activeTab === tab.id ? "bg-white text-blue-700 shadow-sm dark:bg-[#162644] dark:text-cyan-300" : "text-slate-600 dark:text-slate-400")}>
            {tab.label}{count > 0 && <span className="ml-1 text-[10px]">({count})</span>}
          </button>;
        })}
      </div>
      <div className="max-h-[min(28rem,65dvh)] overflow-y-auto p-3">
        {error && <button type="button" onClick={() => void fetchAlerts()} className="mb-2 w-full rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-600 dark:bg-[#0D192E] dark:text-slate-300">{error}</button>}
        {isLoading && <div className="flex items-center gap-2 px-2 py-2 text-xs text-slate-500 dark:text-slate-400"><Loader2 className="h-3 w-3 animate-spin" />Đang cập nhật…</div>}
        {filtered.length === 0 && !isLoading && !error && <div className="flex flex-col items-center gap-2 py-9 text-center text-xs text-slate-500 dark:text-slate-400"><Inbox className="h-7 w-7" />{activeTab === "learning" ? "Chưa có cập nhật khóa học mới." : activeTab === "suggestion" ? "Chưa có gợi ý mới cho bạn." : "Bạn đã xem hết thông báo hiện có."}</div>}
        <div className="space-y-2">{filtered.map(alert => {
          const key = notificationKey(alert), read = readAlertKeys.has(key), learning = notificationCategory(alert) === "learning";
          const Icon = learning ? BookOpen : Sparkles;
          return <div key={key} className={cn("flex gap-1 rounded-xl border transition-colors", read ? "border-slate-100 bg-slate-50/50 dark:border-blue-500/5 dark:bg-[#0D192E]/40" : "border-blue-100 bg-blue-50/40 dark:border-blue-500/20 dark:bg-[#132240]")}>
            <button type="button" onClick={() => openNotice(alert)} className="flex min-w-0 flex-1 items-start gap-3 rounded-xl p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", learning ? "text-blue-600 dark:text-cyan-400" : "text-violet-600 dark:text-violet-400")} />
              <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">{notificationTitle(alert)}{!read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-cyan-400" />}</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600 dark:text-slate-300">{notificationMessage(alert)}</span>
                {alert.course_title && <span className="mt-2 block truncate text-[11px] font-medium text-blue-700 dark:text-cyan-300">{alert.course_title}</span>}
              </span>
            </button>
            {!read && <button type="button" onClick={() => markAlertAsRead(alert)} aria-label={`Đánh dấu đã đọc: ${notificationTitle(alert)}`} className="m-1 self-start rounded-lg p-2 text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-[#162644]"><Check className="h-3.5 w-3.5" /></button>}
          </div>;
        })}</div>
      </div>
    </div>}
  </div>;
}
