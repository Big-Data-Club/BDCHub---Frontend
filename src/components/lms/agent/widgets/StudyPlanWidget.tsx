"use client";

/**
 * StudyPlanWidget - renders a personalized study plan from the mentor agent.
 *
 * Backend schema (get_study_plan.py ui_instruction.props):
 *   { plan: PlanSection[], due_today: number }
 *
 * Each PlanSection: { priority, type, title, description, items: PlanItem[] }
 * PlanItem (review): { question_id, node_name, overdue_days }
 * PlanItem (study):  { node_name, mastery, suggestion }
 * PlanItem (strength): { node_name, mastery }
 */
import { BookOpen, RefreshCw, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────── */

interface ReviewItem   { question_id?: number; node_name: string; overdue_days?: string; }
interface StudyItem    { node_name: string; mastery?: number; suggestion?: string; }
interface StrengthItem { node_name: string; mastery?: number; }

interface PlanSection {
  priority: number;
  type: "review" | "study" | "strength";
  title: string;
  description?: string;
  items: (ReviewItem | StudyItem | StrengthItem)[];
}

interface StudyPlanWidgetProps {
  props: {
    plan?: PlanSection[];
    due_today?: number;
    /** Legacy format - array of { topic, reason, priority, mastery } */
    items?: { topic: string; reason?: string; priority?: string; mastery?: number }[];
    title?: string;
  };
}

/* ── Helpers ────────────────────────────────────────────────── */

const TYPE_CONFIG = {
  review: {
    icon: RefreshCw,
    trackCls: "border-t-2 border-t-rose-500",
    badgeCls: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400",
    iconCls: "text-rose-500",
    label: "Ôn tập",
  },
  study: {
    icon: AlertCircle,
    trackCls: "border-t-2 border-t-amber-500",
    badgeCls: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
    iconCls: "text-amber-500",
    label: "Cần cải thiện",
  },
  strength: {
    icon: TrendingUp,
    trackCls: "border-t-2 border-t-emerald-500",
    badgeCls: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
    iconCls: "text-emerald-500",
    label: "Điểm mạnh",
  },
} as const;

function MasteryBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
        <div className={cn("h-1.5 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 tabular-nums w-8 text-right font-medium">{pct}%</span>
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────── */

export function StudyPlanWidget({ props }: StudyPlanWidgetProps) {
  const { plan, due_today, items: legacyItems, title } = props;

  /* ── Legacy format fallback ── */
  if (!plan && legacyItems && legacyItems.length > 0) {
    const PRIO: Record<string, string> = {
      high:   "border-t-2 border-t-rose-500",
      medium: "border-t-2 border-t-amber-500",
      low:    "border-t-2 border-t-emerald-500",
    };
    return (
      <div className="space-y-3 mt-2">
        <div className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
          {title || "Kế hoạch học tập"}
        </div>
        <div className="space-y-2">
          {legacyItems.map((item, i) => (
            <div key={i} className={cn(
              "flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-blue-500/15 bg-white dark:bg-[#0F1E35]",
              PRIO[item.priority ?? "medium"],
            )}>
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.topic}</p>
                {item.reason && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.reason}</p>}
                {item.mastery !== undefined && <MasteryBar value={item.mastery} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!plan || plan.length === 0) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
        <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
          Kế hoạch học tập hôm nay
        </span>
        {due_today !== undefined && due_today > 0 && (
          <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-semibold">
            {due_today} bài ôn hôm nay
          </span>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-2.5">
        {plan.map((section, si) => {
          const cfg = TYPE_CONFIG[section.type] ?? TYPE_CONFIG.study;
          const Icon = cfg.icon;
          return (
            <div key={si} className={cn(
              "rounded-xl border border-slate-200/80 dark:border-blue-500/15 bg-white dark:bg-[#0F1E35] overflow-hidden shadow-xs dark:shadow-none",
              cfg.trackCls,
            )}>
              {/* Section header */}
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50/70 dark:bg-[#070E1C]">
                <Icon className={cn("h-4 w-4 flex-shrink-0", cfg.iconCls)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{section.title}</p>
                  {section.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{section.description}</p>
                  )}
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0", cfg.badgeCls)}>
                  {cfg.label}
                </span>
              </div>

              {/* Items */}
              {section.items.length > 0 && (
                <div className="divide-y divide-slate-100 dark:divide-blue-500/10">
                  {section.items.map((item, ii) => {
                    const name = (item as any).node_name || (item as any).topic || "";
                    const mastery = (item as any).mastery as number | undefined;
                    const sub = (item as any).suggestion || (item as any).reason || (item as any).overdue_days;
                    return (
                      <div key={ii} className="flex items-start gap-2.5 px-3.5 py-2">
                        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{name}</p>
                          {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
                          {mastery !== undefined && <MasteryBar value={mastery} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
