"use client";

import { useEffect, useRef, useState } from "react";
import { 
  X, Cpu, Layers, Activity, Search, FileCode, CheckCircle, 
  XCircle, AlertTriangle, ShieldAlert, Sparkles, ChevronDown, ChevronUp 
} from "lucide-react";
import type { AgentMessage, SubAgentLog } from "@/types";
import { cn } from "@/lib/utils";

interface AgentConsoleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMessage: AgentMessage | null;
  className?: string;
}

export function AgentConsoleSidebar({
  isOpen,
  onClose,
  activeMessage,
  className,
}: AgentConsoleSidebarProps) {
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console if a sub-agent is streaming thoughts
  useEffect(() => {
    if (activeMessage?.multiAgentLogs?.some(l => l.status === "running")) {
      consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMessage?.multiAgentLogs]);



  const toggleLog = (id: string) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const logs = activeMessage?.multiAgentLogs || [];
  const score = activeMessage?.spawningScore ?? 0.0;
  const breakdown = activeMessage?.spawningBreakdown || {};
  const consolidation = activeMessage?.consolidation;
  const critique = activeMessage?.critiqueReport;

  // Spawning status
  const didSpawn = score >= 0.5;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out z-[60]",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Slide-over Console Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex flex-col h-full w-[360px] max-w-[90vw] border-l bg-slate-50 dark:bg-[#070E1C] border-slate-200 dark:border-blue-500/10 transition-transform duration-300 ease-in-out overflow-hidden shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
      {/* Console Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-blue-500/10 bg-white dark:bg-[#070E1C]">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600 dark:text-cyan-400 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
            Multi-Agent Console
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#162644] transition-colors active:scale-95"
          title="Đóng console"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Console Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 bg-slate-50/50 dark:bg-[#050B18]">
        
        {/* SECTION 1: Mathematical Spawning Decision */}
        <div className="bg-white dark:bg-[#0F1E35] p-4 rounded-xl border border-slate-200 dark:border-blue-500/15 shadow-xs dark:shadow-none space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Spawning Evaluation
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0",
                didSpawn 
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" 
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              {didSpawn ? "SPAWNED MULTI-AGENT" : "SINGLE-AGENT"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Spawning Score (S)</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{score.toFixed(3)}</span>
            </div>
            
            {/* Visual Gauge */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  didSpawn ? "bg-emerald-500" : "bg-blue-500"
                )}
                style={{ width: `${Math.min(100, score * 100)}%` }}
              />
              {/* Threshold indicator at 50% */}
              <div className="absolute left-1/2 top-0 w-0.5 h-full bg-red-400 dark:bg-red-600" title="Threshold: 0.5" />
            </div>

            {/* Formula Breakdown */}
            {breakdown && Object.keys(breakdown).length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex justify-between">
                  <span>Context Pres. (w_c):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{(breakdown.c_ratio || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Intent Comp. (w_d):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{(breakdown.d_intent || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retrieval Vol. (w_r):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{(breakdown.r_docs || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification (w_v):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{(breakdown.v_need || 0).toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Context Consolidation */}
        {consolidation && (
          <div className="bg-white dark:bg-[#0F1E35] p-4 rounded-xl border border-slate-200/80 dark:border-blue-500/10 shadow-xs dark:shadow-none space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-500" /> Context Consolidation
            </span>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Raw Context:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{consolidation.raw_tokens} tokens</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Consolidated Context:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{consolidation.consolidated_tokens} tokens</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-850">
                <span className="text-slate-500">Compression Savings:</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400">
                  {consolidation.compression_ratio}% Savings
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Critique / Critic Report Card */}
        {critique && (
          <div className="bg-white dark:bg-[#0F1E35] p-4 rounded-xl border border-slate-200/80 dark:border-blue-500/10 shadow-xs dark:shadow-none space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Critique Report Card
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  critique.verdict === "approve"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                )}
              >
                {critique.verdict === "approve" ? "APPROVED" : "REVISION REQUIRED"}
              </span>
            </div>

            <div className="space-y-3">
              {/* Scores Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center bg-slate-50/60 dark:bg-[#0D192E] p-2 rounded-lg border border-slate-200/60 dark:border-blue-500/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Factuality</span>
                  <span className={cn(
                    "text-sm font-bold mt-0.5",
                    critique.factuality_score >= 0.7 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                    {(critique.factuality_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex flex-col items-center bg-slate-50/60 dark:bg-[#0D192E] p-2 rounded-lg border border-slate-200/60 dark:border-blue-500/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Pedagogy</span>
                  <span className={cn(
                    "text-sm font-bold mt-0.5",
                    critique.pedagogy_score >= 0.7 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                    {(critique.pedagogy_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex flex-col items-center bg-slate-50/60 dark:bg-[#0D192E] p-2 rounded-lg border border-slate-200/60 dark:border-blue-500/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Format</span>
                  <span className={cn(
                    "text-sm font-bold mt-0.5",
                    critique.format_score >= 0.7 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                    {(critique.format_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Feedback text */}
              {critique.critique_report && (
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50/60 dark:bg-[#0D192E] p-2.5 rounded-xl border border-slate-200/60 dark:border-blue-500/10 leading-relaxed max-h-36 overflow-y-auto">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Critic Feedback:</span>
                  {critique.critique_report}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: Sub-Agents Execution Timeline */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
            Execution Timeline
          </span>

          {logs.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-[#0F1E35] rounded-xl border border-slate-200/80 dark:border-blue-500/10 text-xs text-slate-500 dark:text-slate-400 shadow-xs dark:shadow-none">
              No active sub-agents spawned for this turn.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const isExpanded = expandedLogs[log.subagentId] ?? true;
                const statusColor = 
                  log.status === "running" ? "text-blue-500 bg-blue-50 dark:bg-blue-950/20" : 
                  log.status === "completed" ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : 
                  "text-rose-500 bg-rose-50 dark:bg-rose-950/20";

                return (
                  <div
                    key={log.subagentId}
                    className="bg-white dark:bg-[#0F1E35] rounded-xl border border-slate-200/80 dark:border-blue-500/10 overflow-hidden shadow-xs dark:shadow-none transition-all duration-200"
                  >
                    {/* Header */}
                    <div 
                      onClick={() => toggleLog(log.subagentId)}
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-[#162644]/40 transition-colors select-none gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {log.role.includes("Retrieval") ? <Search className="w-4 h-4 text-orange-500 shrink-0" /> : 
                         log.role.includes("Drafting") ? <FileCode className="w-4 h-4 text-blue-500 shrink-0" /> : 
                         <CheckCircle className="w-4 h-4 text-purple-500 shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {log.role}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={log.task}>
                            {log.task}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold uppercase", statusColor)}>
                          {log.status}
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </div>

                    {/* Collapsible log output */}
                    <div
                      className={cn(
                        "grid transition-all duration-300 ease-in-out bg-slate-950 dark:bg-[#0A1424]",
                        isExpanded 
                          ? "grid-rows-[1fr] opacity-100 border-t border-slate-100 dark:border-slate-800/80" 
                          : "grid-rows-[0fr] opacity-0 border-t-0 border-transparent"
                      )}
                    >
                      <div className="overflow-hidden max-w-full">
                        <div className="p-3 text-[11px] font-mono text-emerald-400 dark:text-emerald-500 space-y-2">
                          <div className="max-h-56 overflow-y-auto leading-relaxed whitespace-pre-wrap break-words">
                            {log.thinking || "Waiting for output..."}
                            {log.status === "running" && (
                              <span className="inline-block w-1 h-3 bg-emerald-400 ml-1 animate-pulse" />
                            )}
                          </div>
                          {log.summary && (
                            <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 font-sans italic leading-relaxed">
                              Result: {log.summary}
                            </div>
                          )}
                          {log.error && (
                            <div className="text-[10px] text-rose-400 border-t border-slate-800 pt-2 font-sans italic leading-relaxed">
                              Error: {log.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Scroll anchor */}
        <div ref={consoleEndRef} />
      </div>
    </div>
    </>
  );
}
