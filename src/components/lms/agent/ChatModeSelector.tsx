"use client";

import { useState, useRef, useEffect, memo } from "react";
import { Zap, Compass, Brain, Info, X, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ChatMode } from "@/types";

export interface ModeConfig {
  id: ChatMode;
  name: string;
  shortLabel: string;
  tagline: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  hoverBg: string;
  details: string[];
}

export const CHAT_MODES: Record<ChatMode, ModeConfig> = {
  flash: {
    id: "flash",
    name: "Flash",
    shortLabel: "Flash",
    tagline: "Nhanh & Tức thì",
    description: "Trả lời ngay dựa trên bài học hiện tại & tri thức AI, không tìm kiếm ngoài hay gọi công cụ thừa.",
    badge: "⚡ Siêu tốc",
    icon: Zap,
    accentColor: "text-amber-500 dark:text-amber-400",
    activeBg: "bg-amber-500/15 dark:bg-amber-500/20",
    activeText: "text-amber-700 dark:text-amber-300 font-semibold",
    activeBorder: "border-amber-500/40 dark:border-amber-400/40 shadow-xs shadow-amber-500/10",
    hoverBg: "hover:bg-amber-500/10",
    details: [
      "1 lượt xử lý trực tiếp (Direct Generation - 0 tools)",
      "Không lặp công cụ tìm kiếm, phản hồi trong vài giây",
      "Tiết kiệm tối đa tài nguyên và thời gian chờ",
      "Tối ưu cho: Định nghĩa, tóm tắt bài học, cú pháp lệnh, câu hỏi ngắn",
    ],
  },
  standard: {
    id: "standard",
    name: "Chuẩn",
    shortLabel: "Chuẩn",
    tagline: "Bám sát giáo trình",
    description: "Tra cứu tài liệu khóa học & Knowledge Graph nội bộ. Đối chiếu công thức, slide bài giảng và bài tập thực hành.",
    badge: "🎯 Giáo trình",
    icon: Compass,
    accentColor: "text-blue-600 dark:text-cyan-400",
    activeBg: "bg-blue-500/15 dark:bg-cyan-500/20",
    activeText: "text-blue-700 dark:text-cyan-300 font-semibold",
    activeBorder: "border-blue-500/40 dark:border-cyan-400/40 shadow-xs shadow-cyan-500/10",
    hoverBg: "hover:bg-blue-500/10 dark:hover:bg-cyan-500/10",
    details: [
      "Tối đa 3 bước ReAct (Vector Search + Knowledge Graph)",
      "Khoanh vùng tài liệu khóa học, trích dẫn số trang chính xác",
      "Chặn cào web lan man ngoài phạm vi học tập",
      "Tối ưu cho: Hỏi bài tập, giải thích công thức môn học, ôn thi",
    ],
  },
  deep: {
    id: "deep",
    name: "Deep Thinking",
    shortLabel: "Sâu",
    tagline: "Suy luận sâu & Mở rộng",
    description: "Suy luận đa bước chuyên sâu, đối chiếu tài liệu nội bộ + mở rộng Web Search khi cần, kích hoạt Multi-Agent.",
    badge: "🧠 Phân tích",
    icon: Brain,
    accentColor: "text-purple-600 dark:text-purple-400",
    activeBg: "bg-purple-500/15 dark:bg-purple-500/20",
    activeText: "text-purple-700 dark:text-purple-300 font-semibold",
    activeBorder: "border-purple-500/40 dark:border-purple-400/40 shadow-xs shadow-purple-500/10",
    hoverBg: "hover:bg-purple-500/10",
    details: [
      "Tối đa 7 bước ReAct hoặc tự động spawn Multi-Agent",
      "Được phép tra cứu Web khi giáo trình chưa có thông tin",
      "Phản biện logic (Critique) và tổng hợp đa chiều",
      "Tối ưu cho: Nghiên cứu chuyên sâu, đồ án phức tạp, đối chiếu thuật toán",
    ],
  },
};

interface ChatModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
  className?: string;
}

export const ChatModeSelector = memo(function ChatModeSelector({
  currentMode,
  onModeChange,
  disabled = false,
  className,
}: ChatModeSelectorProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [transientToast, setTransientToast] = useState<{
    mode: ChatMode;
    text: string;
  } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectMode = (mode: ChatMode) => {
    if (disabled || mode === currentMode) return;

    onModeChange(mode);
    const targetConfig = CHAT_MODES[mode];

    // Notification via Sonner
    toast.info(`Chế độ ${targetConfig.name}`, {
      description: targetConfig.tagline + ": " + targetConfig.description,
      duration: 3000,
    });

    // Inline transient status badge
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setTransientToast({
      mode,
      text: `Đã chuyển sang chế độ ${targetConfig.name}: ${targetConfig.tagline}`,
    });
    toastTimeoutRef.current = setTimeout(() => {
      setTransientToast(null);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const activeConfig = CHAT_MODES[currentMode] || CHAT_MODES.standard;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Mode Buttons Row */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-[#070E1C]/90 border border-slate-200/80 dark:border-blue-500/15 backdrop-blur-xs">
          {(["flash", "standard", "deep"] as ChatMode[]).map((mode) => {
            const config = CHAT_MODES[mode];
            const Icon = config.icon;
            const isActive = currentMode === mode;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleSelectMode(mode)}
                disabled={disabled}
                className={cn(
                  "relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer select-none",
                  isActive
                    ? cn(config.activeBg, config.activeText, "border", config.activeBorder)
                    : cn(
                        "text-slate-500 dark:text-slate-400 border border-transparent",
                        config.hoverBg,
                        "hover:text-slate-800 dark:hover:text-slate-200",
                      ),
                  disabled && "opacity-50 cursor-not-allowed",
                )}
                title={`${config.name} (${config.tagline}): ${config.description}`}
              >
                <Icon
                  className={cn(
                    "w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200",
                    isActive ? config.accentColor : "text-slate-400 dark:text-slate-500",
                    isActive && "scale-110",
                  )}
                />
                <span>{config.shortLabel}</span>
                {isActive && (
                  <span className="hidden sm:inline-block text-[10px] opacity-75 ml-0.5">
                    ({config.tagline})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Info button to open full mode explainer */}
        <button
          type="button"
          onClick={() => setShowInfoModal(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-[#0F1E35] transition-colors cursor-pointer"
          title="Xem giải thích chi tiết các chế độ AI"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chi tiết chế độ</span>
        </button>
      </div>

      {/* Inline transient notification badge upon switching */}
      {transientToast && (
        <div
          className={cn(
            "flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs animate-in fade-in slide-in-from-top-1 duration-200",
            transientToast.mode === "flash" &&
              "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
            transientToast.mode === "standard" &&
              "bg-blue-500/10 text-blue-700 dark:text-cyan-300 border border-blue-500/20",
            transientToast.mode === "deep" &&
              "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20",
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {transientToast.mode === "flash" && <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
            {transientToast.mode === "standard" && <Compass className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400 flex-shrink-0" />}
            {transientToast.mode === "deep" && <Brain className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />}
            <span className="truncate">{transientToast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setTransientToast(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Mode Comparison Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#070E1C] border border-slate-200 dark:border-blue-500/20 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-cyan-500/15 flex items-center justify-center text-blue-600 dark:text-cyan-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Chọn chế độ AI phù hợp
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tùy chỉnh độ sâu suy luận để có phản hồi nhanh chóng hoặc phân tích chuyên sâu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0F1E35] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {(["flash", "standard", "deep"] as ChatMode[]).map((mode) => {
                const cfg = CHAT_MODES[mode];
                const Icon = cfg.icon;
                const isSelected = currentMode === mode;

                return (
                  <div
                    key={mode}
                    onClick={() => {
                      handleSelectMode(mode);
                      setShowInfoModal(false);
                    }}
                    className={cn(
                      "flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer",
                      isSelected
                        ? cn(cfg.activeBg, cfg.activeBorder, "ring-1 ring-blue-500/30 dark:ring-cyan-500/30")
                        : "border-slate-200/80 dark:border-blue-500/15 bg-slate-50/50 dark:bg-[#0B1830]/50 hover:border-slate-300 dark:hover:border-blue-500/30",
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center",
                              cfg.activeBg,
                              cfg.accentColor,
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                              {cfg.name}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white dark:bg-cyan-500 dark:text-[#070E1C]">
                            <Check className="w-2.5 h-2.5" /> Đang dùng
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                        {cfg.tagline}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                        {cfg.description}
                      </p>

                      <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        {cfg.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-blue-500 dark:text-cyan-400 font-bold mt-0.5">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={cn(
                        "mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer",
                        isSelected
                          ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-[#070E1C]"
                          : "bg-slate-200/70 hover:bg-slate-300/70 dark:bg-[#12223A] dark:hover:bg-[#162947] text-slate-700 dark:text-slate-200",
                      )}
                    >
                      {isSelected ? "Đang chọn" : "Chọn chế độ này"}
                      {!isSelected && <ArrowRight className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer Tip */}
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-[#0B1830]/80 border border-slate-200/60 dark:border-blue-500/15 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              💡 <span className="font-semibold text-slate-700 dark:text-slate-200">Gợi ý sử dụng:</span> Chọn{" "}
              <strong className="text-amber-600 dark:text-amber-400">Flash</strong> khi cần hỏi nhanh để không mất thời gian chờ. Chọn{" "}
              <strong className="text-blue-600 dark:text-cyan-400">Chuẩn</strong> cho 90% câu hỏi bài học để bám sát giáo trình. Chỉ chọn{" "}
              <strong className="text-purple-600 dark:text-purple-400">Deep Thinking</strong> cho các câu hỏi tổng hợp khó hoặc cần tra cứu ngoài.
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
