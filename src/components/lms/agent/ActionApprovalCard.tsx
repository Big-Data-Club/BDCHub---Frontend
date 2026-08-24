"use client";

import { useState } from "react";
import { Check, Pencil, Route, X } from "lucide-react";
import type { HITLRequestData } from "@/types";
import { cn } from "@/lib/utils";

interface ActionApprovalCardProps {
  request: HITLRequestData;
  onApprove?: (request: HITLRequestData) => void;
  onReject?: (request: HITLRequestData) => void;
}

/**
 * A safe fallback HITL surface for actions that do not have a specialised
 * editable widget.  Mutating actions should still return their own draft
 * widget; this card makes navigation and future actions explicit by default.
 */
export function ActionApprovalCard({ request, onApprove, onReject }: ActionApprovalCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const isNavigation = request.data?.action === "navigate";
  const label = request.data?.label || (isNavigation ? "Mở trang" : "Xác nhận thực hiện");

  if (dismissed) return null;

  return (
    <section className="mt-3 w-full rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-900/70 dark:bg-amber-950/20">
      <div className="flex gap-2.5">
        <div className="mt-0.5 rounded-lg bg-amber-100 p-1.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          {isNavigation ? <Route className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">Cần bạn xác nhận</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{request.message}</p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {isNavigation ? "Agent sẽ chỉ chuyển trang sau khi bạn đồng ý." : "Bạn có thể chỉnh sửa bản nháp trong thẻ bên dưới trước khi xác nhận."}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 pl-11">
        <button
          type="button"
          onClick={() => onApprove?.(request)}
          className={cn("inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white", "transition hover:bg-amber-700 active:scale-95")}
        >
          <Check className="h-3.5 w-3.5" /> {label}
        </button>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onReject?.(request);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <X className="h-3.5 w-3.5" /> Để sau
        </button>
      </div>
    </section>
  );
}
