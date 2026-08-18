"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import aiService, {
  ConsolidationGroup,
  ConsolidationPreview,
} from "@/services/ai/aiService";
import { cn } from "@/lib/utils";

interface Props {
  courseId: number;
  open: boolean;
  onClose: () => void;
}

type Phase = "loading" | "preview" | "executing" | "error";

const KIND_BADGE: Record<string, { label: string; cls: string }> = {
  hard:  { label: "Trùng lặp",  cls: "bg-rose-50 text-rose-700 border-rose-200" },
  soft:  { label: "Tương đồng", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  micro: { label: "Mảnh nhỏ",   cls: "bg-sky-50 text-sky-700 border-sky-200" },
};

export default function GraphConsolidateModal({ courseId, open, onClose }: Props) {
  const [phase, setPhase]       = useState<Phase>("loading");
  const [preview, setPreview]   = useState<ConsolidationPreview | null>(null);
  const [error, setError]       = useState<string>("");
  const [enabled, setEnabled]   = useState<Record<number, boolean>>({});
  const [statusMsg, setStatusMsg] = useState<string>("");

  // Reset & fetch the dry-run plan whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setPhase("loading");
    setError("");
    setPreview(null);
    setStatusMsg("");

    aiService
      .previewGraphConsolidation(courseId)
      .then((p) => {
        setPreview(p);
        setEnabled(Object.fromEntries(p.groups.map((g) => [g.survivor_id, true])));
        setPhase("preview");
      })
      .catch((e: any) => {
        setError(e?.response?.data?.error ?? e?.message ?? "Không thể tải kế hoạch hợp nhất");
        setPhase("error");
      });
  }, [open, courseId]);

  const stats = useMemo(() => {
    if (!preview) return { selectedGroups: 0, willAbsorb: 0, willDeleteOrphans: 0 };
    let willAbsorb = 0;
    let selectedGroups = 0;
    for (const g of preview.groups) {
      if (enabled[g.survivor_id]) {
        selectedGroups += 1;
        willAbsorb += g.absorbed_ids.length;
      }
    }
    return {
      selectedGroups,
      willAbsorb,
      willDeleteOrphans: preview.orphaned_ids?.length ?? 0,
    };
  }, [preview, enabled]);

  const handleToggle = (survivorId: number) => {
    setEnabled((m) => ({ ...m, [survivorId]: !m[survivorId] }));
  };

  const handleConfirm = async () => {
    if (!preview || (stats.selectedGroups === 0 && stats.willDeleteOrphans === 0)) return;

    setPhase("executing");
    setStatusMsg("Đang gửi yêu cầu…");
    try {
      const selectedSurvivorIds = preview.groups
        .filter((group) => enabled[group.survivor_id])
        .map((group) => group.survivor_id);
      await aiService.triggerGraphConsolidation(
        courseId,
        selectedSurvivorIds,
      );
      toast("Hệ thống đang làm gọn graph trong nền. Bạn có thể tiếp tục làm việc.", {
        icon: "ℹ️",
        duration: 5000,
      });
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? "Không thể chạy hợp nhất");
      setPhase("error");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-blue-500/15 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-[#0D192E] dark:to-[#0A1628]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Làm gọn Graph
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600 dark:text-cyan-400" />
              <p className="text-sm">Đang phân tích graph…</p>
            </div>
          )}

          {phase === "error" && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">
                {error || "Đã xảy ra lỗi không xác định"}
              </div>
            </div>
          )}

          {phase === "executing" && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600 dark:text-cyan-400" />
              <p className="text-sm">{statusMsg || "Đang xử lý…"}</p>
            </div>
          )}

          {phase === "preview" && preview && (
            <>
              {/* Summary */}
              <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-[#0D192E] border border-blue-200 dark:border-blue-500/20 text-sm text-blue-800 dark:text-cyan-300">
                {preview.groups.length === 0 && stats.willDeleteOrphans === 0 ? (
                  <span>
                    Graph đã sạch - không có node nào cần hợp nhất hoặc dọn bỏ.
                  </span>
                ) : (
                  <span>
                    Sẽ gộp <strong>{stats.willAbsorb}</strong> node trùng lặp
                    {stats.willDeleteOrphans > 0 && (
                      <> và xóa <strong>{stats.willDeleteOrphans}</strong> node tự sinh không có tài liệu</>
                    )}. Graph còn{" "}
                    <strong>{preview.total_nodes_before - stats.willAbsorb - stats.willDeleteOrphans}</strong>/{
                      preview.total_nodes_before
                    }{" "}
                    nodes (giảm{" "}
                    {Math.round(
                      (100 * (stats.willAbsorb + stats.willDeleteOrphans)) /
                        Math.max(1, preview.total_nodes_before)
                    )}
                    %).
                  </span>
                )}
              </div>

              {stats.willDeleteOrphans > 0 && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                  <div className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        {stats.willDeleteOrphans} node tự sinh không có tài liệu sẽ được xóa
                      </p>
                      <p className="mt-1 text-xs opacity-80">
                        Node tạo thủ công được giữ nguyên. Backend sẽ kiểm tra lại chunk ngay trước khi xóa.
                      </p>
                      <div className="mt-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                        {(preview.orphaned_ids ?? []).map((id) => (
                          <span key={id} className="rounded bg-white/80 px-2 py-0.5 text-xs dark:bg-slate-900/50">
                            {preview.orphaned_names?.[String(id)] ?? `#${id}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Group list */}
              <div className="space-y-3">
                {preview.groups.map((g) => (
                  <GroupCard
                    key={g.survivor_id}
                    group={g}
                    enabled={!!enabled[g.survivor_id]}
                    onToggle={() => handleToggle(g.survivor_id)}
                  />
                ))}
              </div>

              {preview.groups.length === 0 && stats.willDeleteOrphans === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">
                  Không phát hiện node nào trùng lặp ở thời điểm này.
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={phase === "executing"}
            className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            Hủy
          </button>
          {phase === "preview" && preview && (preview.groups.length > 0 || stats.willDeleteOrphans > 0) && (
            <button
              onClick={handleConfirm}
              disabled={stats.selectedGroups === 0 && stats.willDeleteOrphans === 0}
              className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Xác nhận Làm gọn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function GroupCard({
  group,
  enabled,
  onToggle,
}: {
  group: ConsolidationGroup;
  enabled: boolean;
  onToggle: () => void;
}) {
  const survivorName = group.old_names[String(group.survivor_id)] ?? group.new_name_vi ?? group.new_name;
  const badge = KIND_BADGE[group.kind] ?? KIND_BADGE.soft;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        enabled
          ? "border-blue-300 dark:border-blue-500/30 bg-white dark:bg-[#0F1E35]"
          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          className="mt-1 w-4 h-4 accent-blue-600"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-xs uppercase font-bold px-2 py-0.5 rounded-full border",
                badge.cls
              )}
            >
              {badge.label}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              độ tương đồng {Math.round(group.similarity * 100)}%
            </span>
          </div>

          {/* Merge visualization */}
          <div className="mt-2 flex items-center gap-2 flex-wrap text-sm">
            {group.absorbed_ids.map((aid) => (
              <span
                key={aid}
                className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 line-through decoration-rose-400"
                title={`#${aid}`}
              >
                {group.old_names[String(aid)] ?? `#${aid}`}
              </span>
            ))}
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="px-2 py-1 rounded-md bg-blue-50 dark:bg-cyan-950/30 text-blue-700 dark:text-cyan-300 font-semibold border border-blue-200/60 dark:border-cyan-500/20">
              {group.new_name_vi || group.new_name || survivorName}
            </span>
          </div>

          {group.new_description && (
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {group.new_description}
            </p>
          )}

          {group.reason && (
            <p className="mt-1.5 text-xs italic text-slate-500">
              {group.reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
