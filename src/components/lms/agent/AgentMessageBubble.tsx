"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, User, Wrench, Check, AlertCircle, ChevronDown, ChevronRight, BookOpen, Globe, Cpu, Layers, Sparkles } from "lucide-react";
import type { AgentMessage } from "@/types";
import { AgentThinkingIndicator } from "./AgentThinkingIndicator";
import { ClarificationCard } from "./ClarificationCard";
import { WidgetRenderer } from "./WidgetRenderer";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import lmsService from "@/services/lmsService";

interface AgentMessageBubbleProps {
  message: AgentMessage;
  onClarificationSelect?: (option: string) => void;
  isSelectedForLogs?: boolean;
  onSelectForLogs?: () => void;
}

const ReferenceLink = ({ contentId, title, pageNumber }: { contentId: number; title: string; pageNumber?: number }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    lmsService.getContent(contentId)
      .then((res) => {
        const content = res?.data || res;
        if (content && content.file_path) {
          let fileUrl = `/lmsapiv1/files/serve/${content.file_path}`;
          if (pageNumber) {
            fileUrl += `#page=${pageNumber}`;
          }
          setUrl(fileUrl);
        }
      })
      .catch((err) => console.error("Failed to load reference content", err));
  }, [contentId, pageNumber]);

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-blue-500 hover:underline transition-colors break-all"
      >
        {title}
      </a>
    );
  }

  return <span>{title}</span>;
};

export function AgentMessageBubble({
  message,
  onClarificationSelect,
  isSelectedForLogs = false,
  onSelectForLogs,
}: AgentMessageBubbleProps) {
  const isUser = message.role === "user";
  const [showThinking, setShowThinking] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleLog = (id: string) => {
    setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const logs = message.multiAgentLogs || [];
  const score = message.spawningScore ?? 0.0;
  const breakdown = message.spawningBreakdown || {};
  const consolidation = message.consolidation;
  const critique = message.critiqueReport;
  const didSpawn = score >= 0.5;

  const hasRunningLogs = logs.some((l) => l.status === "running");

  // Auto-expand thinking box when streaming thinking delta
  useEffect(() => {
    if (message.isStreaming && message.thinking && !message.content) {
      setShowThinking(true);
    }
  }, [message.isStreaming, message.thinking, message.content]);

  // Auto-expand trace if a sub-agent is active/running
  useEffect(() => {
    if (hasRunningLogs) {
      setShowTrace(true);
    }
  }, [hasRunningLogs]);

  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full",
            "flex items-center justify-center shadow-md shadow-blue-500/10",
            "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
          )}
        >
          <Bot className="w-4.5 h-4.5" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] md:max-w-[80%] lg:max-w-[85%] space-y-1",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Tool activities */}
        {!isUser && message.toolActivities && message.toolActivities.length > 0 && (
          <div className="space-y-1 mb-2">
            {message.toolActivities.map((t, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg border",
                  t.status === "running"
                    ? "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse"
                    : t.status === "error"
                    ? "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"
                    : "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                )}
              >
                {t.status === "running" ? (
                  <Wrench className="w-3 h-3 animate-spin" />
                ) : t.status === "error" ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                <span className="font-semibold">{t.tool}</span>
                {t.message && <span className="opacity-70">— {t.message}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Thinking indicator */}
        {!isUser && message.isStreaming && !message.content && !message.thinking && (
          <AgentThinkingIndicator steps={message.thinkingSteps} />
        )}

        {/* Collapsible Chain of Thought (Thinking logs) */}
        {!isUser && message.thinking && (
          <div className="w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mb-2.5 shadow-lg shadow-black/10">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-[11px] font-semibold text-slate-400 bg-slate-900/40 hover:bg-slate-900/80 transition-colors border-b border-slate-900"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {message.isStreaming && !message.content && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  )}
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", message.isStreaming && !message.content ? "bg-blue-500" : "bg-slate-500")}></span>
                </span>
                <span className="font-mono tracking-wider uppercase">LOG::AI_THOUGHT_PROCESS</span>
              </div>
              {showThinking ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {showThinking && (
              <div className="px-3.5 pb-3.5 pt-2 text-[11px] text-emerald-400/90 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                {message.thinking}
                {message.isStreaming && !message.content && <span className="animate-pulse text-blue-400 font-bold">▋</span>}
              </div>
            )}
          </div>
        )}

        {/* Message bubble */}
        {message.content && (
          <div
            className={cn(
              "px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm transition-all duration-250",
              isUser
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-br-sm shadow-blue-500/5 whitespace-pre-wrap break-words"
                : cn(
                    "bg-slate-50/70 dark:bg-slate-900/70 border text-slate-800 dark:text-slate-200 rounded-bl-sm backdrop-blur-sm",
                    isSelectedForLogs
                      ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 shadow-md"
                      : "border-slate-200/50 dark:border-slate-800/50"
                  )
            )}
          >
            {isUser ? (
              message.content
            ) : (
              <MarkdownRenderer
                content={message.content + (message.isStreaming ? ' ▊' : '')}
                variant="chat"
              />
            )}
          </div>
        )}

        {/* References display section */}
        {!isUser && message.references && message.references.length > 0 && (
          <div className="w-full bg-slate-50/80 dark:bg-slate-900/40 border border-slate-250/50 dark:border-slate-800/50 rounded-xl overflow-hidden mt-2">
            <button
              onClick={() => setShowReferences(!showReferences)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Nguồn trích dẫn ({message.references.length})</span>
              </div>
              {showReferences ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {showReferences && (
              <div className="px-3 pb-3 pt-1 space-y-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {message.references.map((ref, idx) => (
                  <div key={idx} className="p-2.5 bg-white dark:bg-slate-900/80 border border-slate-150 dark:border-slate-800/80 rounded-lg space-y-1 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        {ref.source_type === "web" ? (
                          <Globe className="w-3.5 h-3.5 text-cyan-500" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        {ref.url ? (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-500 hover:underline transition-colors break-all"
                          >
                            {ref.title}
                          </a>
                        ) : ref.content_id ? (
                          <ReferenceLink
                            contentId={ref.content_id}
                            title={ref.title || "Tài liệu khóa học"}
                            pageNumber={ref.page_number}
                          />
                        ) : (
                          <span>{ref.title}</span>
                        )}
                      </div>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase",
                        ref.source_type === "web" ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      )}>
                        {ref.source_type === "web" ? "Web" : ref.page_number ? `Trang ${ref.page_number}` : "Tài liệu"}
                      </span>
                    </div>
                    {ref.content && (
                      <p className="text-slate-500 dark:text-slate-400 leading-normal line-clamp-3">
                        {ref.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Telemetry Select Button */}
        {!isUser && onSelectForLogs && (message.spawningScore !== undefined || (message.multiAgentLogs && message.multiAgentLogs.length > 0)) && (
          <div className="flex justify-start pt-1 gap-2">
            <button
              onClick={onSelectForLogs}
              className={cn(
                "flex items-center gap-1 py-0.5 px-2 rounded-lg text-[10px] font-semibold transition-all duration-200 border active:scale-95",
                isSelectedForLogs
                  ? "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 text-blue-600 dark:text-blue-400"
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              title="Đồng bộ hóa vết xử lý sang Console Debugger"
            >
              <Cpu className="w-3 h-3" />
              <span>{isSelectedForLogs ? "Đang đồng bộ Console" : "Đồng bộ Console"}</span>
            </button>

            <button
              onClick={() => setShowTrace(!showTrace)}
              className={cn(
                "flex items-center gap-1 py-0.5 px-2 rounded-lg text-[10px] font-semibold transition-all duration-200 border active:scale-95",
                showTrace
                  ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400"
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              title="Hiện nhật ký giải trình xử lý Multi-Agent inline"
            >
              <Cpu className="w-3 h-3 text-indigo-500" />
              <span>{showTrace ? "Ẩn vết xử lý" : "Hiện vết xử lý"}</span>
            </button>
          </div>
        )}

        {/* Inline Multi-Agent Trace Panel */}
        {!isUser && (message.spawningScore !== undefined || (message.multiAgentLogs && message.multiAgentLogs.length > 0)) && (
          <div className="w-full bg-slate-50/80 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 rounded-xl overflow-hidden mt-2.5">
            <button
              onClick={() => setShowTrace(!showTrace)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-colors border-b border-slate-200/30 dark:border-slate-800/30 bg-slate-100/10 dark:bg-slate-900/10"
            >
              <div className="flex items-center gap-1.5">
                <Cpu className={cn("w-3.5 h-3.5 text-indigo-500", hasRunningLogs && "animate-pulse")} />
                <span>Nhật ký xử lý (Explainability)</span>
                {hasRunningLogs && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded animate-pulse">
                    Đang chạy...
                  </span>
                )}
              </div>
              {showTrace ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {showTrace && (
              <div className="p-3 space-y-3.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-150 dark:border-slate-850">
                {/* 1. Spawning decision */}
                <div className="space-y-1.5 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Đánh giá khởi tạo Agent</span>
                    <span className={cn(
                      "px-1.5 py-0.2 rounded text-[9px]",
                      didSpawn 
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" 
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {didSpawn ? "Chạy Multi-Agent" : "Chạy Single-Agent"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate-500">Điểm số yêu cầu (S-Score):</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{score.toFixed(3)}</span>
                  </div>
                  {breakdown && Object.keys(breakdown).length > 0 && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-400/90 pt-1.5 border-t border-slate-100 dark:border-slate-900">
                      <div>Độ phức tạp câu hỏi: <span className="font-semibold text-slate-600 dark:text-slate-300">{(breakdown.c_ratio || 0).toFixed(2)}</span></div>
                      <div>Độ dài ngữ cảnh: <span className="font-semibold text-slate-600 dark:text-slate-300">{(breakdown.d_intent || 0).toFixed(1)}</span></div>
                      <div>Tài liệu cần tìm kiếm: <span className="font-semibold text-slate-600 dark:text-slate-300">{(breakdown.r_docs || 0).toFixed(1)}</span></div>
                      <div>Độ kiểm chứng cao: <span className="font-semibold text-slate-600 dark:text-slate-300">{(breakdown.v_need || 0).toFixed(1)}</span></div>
                    </div>
                  )}
                </div>

                {/* 2. Context Consolidation */}
                {consolidation && (
                  <div className="space-y-1 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      <Layers className="w-3 h-3 text-orange-500" />
                      <span>Nén ngữ cảnh RAG</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Ngữ cảnh gốc:</span>
                      <span className="font-medium">{consolidation.raw_tokens} tokens</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Ngữ cảnh sau nén:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{consolidation.consolidated_tokens} tokens</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-900 mt-1">
                      <span className="text-slate-500">Tỷ lệ nén giảm thiểu:</span>
                      <span className="text-orange-600 dark:text-orange-400 font-bold">{consolidation.compression_ratio}%</span>
                    </div>
                  </div>
                )}

                {/* 3. Sub-agents timeline */}
                {logs.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trình tự chạy Sub-Agent:</div>
                    <div className="space-y-2">
                      {logs.map((log) => {
                        const logExpanded = expandedLogs[log.subagentId] ?? true;
                        const isRunning = log.status === "running";
                        const isCompleted = log.status === "completed";
                        const isFailed = log.status === "failed";

                        return (
                          <div key={log.subagentId} className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-sm">
                            {/* Subagent Header */}
                            <button
                              onClick={() => toggleLog(log.subagentId)}
                              className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-2 h-2 rounded-full",
                                  isRunning && "bg-blue-500 animate-pulse",
                                  isCompleted && "bg-emerald-500",
                                  isFailed && "bg-rose-500"
                                )} />
                                <div className="leading-tight">
                                  <div className="font-bold text-slate-850 dark:text-slate-150 text-[11px] font-mono">{log.role}</div>
                                  <div className="text-[10px] text-slate-400/90 line-clamp-1">{log.task}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={cn(
                                  "px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider font-mono",
                                  isRunning && "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 animate-pulse",
                                  isCompleted && "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
                                  isFailed && "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                                )}>
                                  {isRunning ? "Running" : isCompleted ? "Done" : "Failed"}
                                </span>
                                {log.thinking ? (
                                  logExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />
                                ) : null}
                              </div>
                            </button>

                            {/* Subagent Details / Thoughts */}
                            {logExpanded && log.thinking && (
                              <div className="p-2 border-t border-slate-100 dark:border-slate-900 bg-slate-950 text-emerald-400/90 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                                {log.thinking}
                                {isRunning && <span className="animate-pulse text-blue-400 font-bold">▋</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Critique Report Card */}
                {critique && (
                  <div className="space-y-2 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span>Kết quả đánh giá (Critique)</span>
                      </div>
                      <span className={cn(
                        "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider",
                        critique.verdict === "approve"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                      )}>
                        {critique.verdict === "approve" ? "Đã thông qua" : "Cần sửa đổi"}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-900/50">
                        <span className="text-[9px] text-slate-400">Tính chính xác</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{(critique.factuality_score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-900/50">
                        <span className="text-[9px] text-slate-400">Tính sư phạm</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{(critique.pedagogy_score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-900/50">
                        <span className="text-[9px] text-slate-400">Format/Định dạng</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{(critique.format_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {critique.critique_report && (
                      <div className="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-900/50 mt-1.5 leading-relaxed max-h-24 overflow-y-auto">
                        <span className="font-bold text-slate-750 dark:text-slate-250 block mb-0.5">Nhận xét chi tiết:</span>
                        {critique.critique_report}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Clarification options */}
        {message.clarification &&
          message.clarification.options.length > 0 &&
          onClarificationSelect && (
            <ClarificationCard
              question={message.clarification.question}
              options={message.clarification.options}
              onSelect={onClarificationSelect}
            />
          )}

        {/* Dynamic UI widget */}
        {message.uiComponent && <WidgetRenderer data={message.uiComponent} />}

        {/* HITL widget (reuses WidgetRenderer if ui_instruction present) */}
        {message.hitlRequest?.ui_instruction && (
          <WidgetRenderer data={message.hitlRequest.ui_instruction} />
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full",
            "flex items-center justify-center shadow-sm",
            "bg-gradient-to-br from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 text-white",
          )}
        >
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

