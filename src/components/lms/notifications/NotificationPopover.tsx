"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, X, Brain, AlertCircle, BookOpen, Sparkles, Inbox } from "lucide-react";
import { useNotifications, StudyAlert } from "@/store/NotificationContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function NotificationPopover() {
  const router = useRouter();
  const { alerts, unreadAlertsCount, fetchAlerts, markAlertAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "study" | "recs">("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePopover = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchAlerts(); // Lazy load notifications on-click
    }
  };

  const handleAction = (alert: StudyAlert) => {
    markAlertAsRead(alert);
    setIsOpen(false);
    
    // Route to appropriate content based on type, course_id, node_id, and quiz_id
    if (alert.alert_type === "quiz_deadline" && alert.quiz_id) {
      router.push(`/lms/student/courses/${alert.course_id}/quiz/${alert.quiz_id}/take`);
    } else if (alert.node_id) {
      router.push(`/lms/student/courses/${alert.course_id}?node_id=${alert.node_id}`);
    } else {
      router.push(`/lms/student/courses/${alert.course_id}`);
    }
  };

  const handleMarkAllRead = () => {
    alerts.forEach((alert) => markAlertAsRead(alert));
  };

  // Filter alerts by tab
  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "all") return true;
    if (activeTab === "study") {
      return alert.alert_type === "concept_struggle" || alert.alert_type === "new_content";
    }
    if (activeTab === "recs") {
      return alert.alert_type === "inactivity" || alert.alert_type === "recommendation" || alert.alert_type === "quiz_deadline";
    }
    return true;
  });

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={togglePopover}
        className={cn(
          "relative p-2 rounded-xl text-slate-600 dark:text-slate-400",
          "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
          "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadAlertsCount > 0 && (
          <span className="absolute top-1 right-1 h-4 min-w-4 flex items-center justify-center
                           bg-red-500 text-white text-[9px] font-bold rounded-full px-1 leading-none
                           pointer-events-none animate-pulse">
            {unreadAlertsCount > 9 ? "9+" : unreadAlertsCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
                        border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[99]
                        transform origin-top-right transition-all duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Thông báo</h3>
              <p className="text-[10px] text-slate-500">Học tập cá nhân hóa & gợi ý</p>
            </div>
            {unreadAlertsCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex bg-slate-50 dark:bg-slate-950 p-1 mx-4 mt-3 rounded-lg border border-slate-200/50 dark:border-slate-800/30">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex-1 text-[11px] py-1.5 rounded-md font-semibold transition-all",
                activeTab === "all"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("study")}
              className={cn(
                "flex-1 text-[11px] py-1.5 rounded-md font-semibold transition-all",
                activeTab === "study"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              Học tập
            </button>
            <button
              onClick={() => setActiveTab("recs")}
              className={cn(
                "flex-1 text-[11px] py-1.5 rounded-md font-semibold transition-all",
                activeTab === "recs"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              Gợi ý
            </button>
          </div>

          {/* Alerts List */}
          <div className="max-h-80 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
                <Inbox className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">Không có thông báo mới nào</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const key = `${alert.alert_type}:${alert.course_id}:${alert.node_id ?? ""}:${alert.quiz_id ?? ""}`;
                const isStruggle = alert.alert_type === "concept_struggle";
                const isRec = alert.alert_type === "recommendation";
                const isDeadline = alert.alert_type === "quiz_deadline";
                const isNewContent = alert.alert_type === "new_content";

                let icon = <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
                let title = "Gợi ý";
                let btnText = "Vào xem";

                if (isStruggle) {
                  icon = <Brain className="w-5 h-5 text-red-500 dark:text-red-400" />;
                  title = "Lỗ hổng kiến thức!";
                  btnText = "Ôn tập ngay";
                } else if (isDeadline) {
                  icon = <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />;
                  title = "Sắp hết hạn làm bài!";
                  btnText = "Làm bài ngay";
                } else if (isNewContent) {
                  icon = <BookOpen className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
                  title = "Bài học mới cập nhật!";
                  btnText = "Học ngay";
                } else if (isRec) {
                  icon = <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
                  title = "Gợi ý khóa học mới!";
                  btnText = "Khám phá ngay";
                } else {
                  // inactivity
                  icon = <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
                  title = "Nhắc nhở ôn tập";
                  btnText = "Vào lớp học";
                }
                
                return (
                  <div
                    key={key}
                    className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-xl relative group flex gap-3 transition hover:bg-slate-50 dark:hover:bg-slate-950/80"
                  >
                    {/* Icon Column */}
                    <div className="flex-shrink-0 mt-0.5">
                      {icon}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        {title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {alert.alert_message}
                      </p>
                      
                      {/* Interactive CTA */}
                      <button
                        onClick={() => handleAction(alert)}
                        className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {btnText}
                      </button>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={() => markAlertAsRead(alert)}
                      className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Bỏ qua"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
