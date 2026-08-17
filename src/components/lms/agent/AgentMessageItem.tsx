"use client";

import { useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { Bot, User, Wrench, Check, AlertCircle, ChevronDown, ChevronRight, BookOpen, Globe, Cpu, Layers, Sparkles, MapPin, BookmarkPlus, Loader2, Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import type { AgentMessage, HITLRequestData } from "@/types";
import { AgentThinkingIndicator } from "./AgentThinkingIndicator";
import { ClarificationCard } from "./ClarificationCard";
import { WidgetRenderer } from "./WidgetRenderer";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import lmsService from "@/services/lmsService";
import { ActionApprovalCard } from "./ActionApprovalCard";
import { saveNotebookEntry } from "@/services/agentService";

interface AgentMessageItemProps {
  message: AgentMessage;
  onClarificationSelect?: (option: string) => void;
  isSelectedForLogs?: boolean;
  onSelectForLogs?: () => void;
  onActionApprove?: (request: HITLRequestData) => void;
  onActionReject?: (request: HITLRequestData) => void;
}

const ReferenceLink = ({ contentId, title, pageNumber }: { contentId: number; title: string; pageNumber?: number }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    lmsService.getContent(contentId)
      .then((res) => {
        const content = res?.data || res;
        if (content?.file_path) {
          let fileUrl = content.file_path;
          if (!fileUrl.startsWith("http")) {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
            const baseUrl = apiBase.replace(/\/api\/v1\/?$/, "");
            fileUrl = `${baseUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
          }
          if (pageNumber) {
            fileUrl += `#page=${pageNumber}`;
          }
          setUrl(fileUrl);
        }
      })
      .catch(() => {});
  }, [contentId, pageNumber]);

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 font-medium"
      >
        <BookOpen className="w-3 h-3 flex-shrink-0" />
        {title}
      </a>
    );
  }

  return <span>{title}</span>;
};

export const AgentMessageItem = memo(function AgentMessageItem({
  message,
  onClarificationSelect,
  isSelectedForLogs = false,
  onSelectForLogs,
  onActionApprove,
  onActionReject,
}: AgentMessageItemProps) {
  const isUser = message.role === "user";
  const [showThinking, setShowThinking] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  const handleCopyContent = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message", err);
    }
  };

  const toggleFeedback = (type: "like" | "dislike") => {
    setFeedback((prev) => (prev === type ? null : type));
  };

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
  const uiComponents = Array.isArray(message.uiComponents)
    ? message.uiComponents.filter((component) => component && typeof component.component === "string")
    : message.uiComponent && typeof message.uiComponent.component === "string"
      ? [message.uiComponent]
      : [];

  const saveResponseToNotebook = async () => {
    if (!message.content || savingNote || noteSaved) return;
    setSavingNote(true);
    try {
      const plainTitle = message.content.replace(/[#*_`]/g, "").split("\n").find(Boolean)?.trim() || "Ghi chú từ AI";
      await saveNotebookEntry({
        title: plainTitle.slice(0, 100),
        content: message.content,
        courseId: message.context?.course_id ?? undefined,
      });
      setNoteSaved(true);
    } catch (error) {
      console.error("Failed to save AI response to notebook", error);
    } finally {
      setSavingNote(false);
    }
  };

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
      <div
        className={cn(
          "space-y-1 transition-all duration-200",
          isUser ? "max-w-[85%] md:max-w-[80%] lg:max-w-[85%] items-end" : "w-full max-w-full items-start"
        )}
      >
        {!isUser && message.toolActivities && message.toolActivities.length > 0 && (
          <div className="space-y-1 mb-2">
            {message.toolActivities.map((t, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border",
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
                {t.message && <span className="opacity-70">- {t.message}</span>}
              </div>
            ))}
          </div>
        )}

        {!isUser && message.isStreaming && !message.content && !message.thinking && (
          <AgentThinkingIndicator steps={message.thinkingSteps} />
        )}

        {!isUser && message.thinking && (
          <div className="w-full border-l-2 border-blue-500/40 dark:border-cyan-400/40 pl-3.5 py-1 mb-3 space-y-1.5 transition-all">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-cyan-400 hover:text-blue-600 dark:hover:text-cyan-300 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                {message.isStreaming && !message.content && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                )}
                <span className={cn("relative inline-flex rounded-full h-2 w-2", message.isStreaming && !message.content ? "bg-cyan-400" : "bg-slate-400 dark:bg-cyan-500/50")}></span>
              </span>
              <span className="font-mono tracking-wider uppercase text-xs">Tiến trình suy nghĩ AI</span>
              {showThinking ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {showThinking && (
              <div className="pt-1 text-xs text-slate-600 dark:text-cyan-300 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                {message.thinking}
                {message.isStreaming && !message.content && <span className="animate-pulse text-cyan-400 font-bold">▋</span>}
              </div>
            )}
          </div>
        )}

        {message.content && (
          <div
            className={cn(
              "text-[14px] leading-relaxed transition-all duration-200",
              isUser
                ? "px-4 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white rounded-br-sm shadow-xs whitespace-pre-wrap break-words"
                : "px-1 py-1 bg-transparent text-slate-800 dark:text-slate-100"
            )}
          >
            {isUser ? (
              <MarkdownRenderer content={message.content} variant="chat-user" />
            ) : (
              <MarkdownRenderer
                content={message.content + (message.isStreaming ? ' ▊' : '')}
                variant="chat"
              />
            )}
          </div>
        )}

        {!isUser && message.content && !message.isStreaming && (
          <div className="flex flex-wrap items-center justify-between gap-2 ml-1 pt-1.5 mt-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleCopyContent}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-[#162644] dark:hover:text-cyan-400 transition-colors cursor-pointer active:scale-95"
                title="Sao chép câu trả lời"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Đã sao chép" : "Sao chép"}</span>
              </button>

              <button
                type="button"
                onClick={saveResponseToNotebook}
                disabled={savingNote || noteSaved}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-blue-600 disabled:cursor-default disabled:text-emerald-600 dark:hover:bg-[#162644] dark:disabled:text-emerald-400 transition-colors cursor-pointer active:scale-95"
                title="Lưu vào Notebook học tập"
              >
                {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
                <span>{noteSaved ? "Đã lưu Notebook" : "Lưu ghi chú"}</span>
              </button>

              <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-blue-500/15 pl-1.5 ml-0.5">
                <button
                  type="button"
                  onClick={() => toggleFeedback("like")}
                  className={cn(
                    "p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer active:scale-95",
                    feedback === "like" && "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  )}
                  title="Hữu ích"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFeedback("dislike")}
                  className={cn(
                    "p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer active:scale-95",
                    feedback === "dislike" && "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
                  )}
                  title="Chưa tốt"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {onClarificationSelect && (
                <button
                  type="button"
                  onClick={() => onClarificationSelect("Tạo lại câu trả lời khác chi tiết hơn")}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-[#162644] dark:hover:text-cyan-400 transition-colors cursor-pointer active:scale-95 border-l border-slate-200 dark:border-blue-500/15 ml-1 pl-2"
                  title="Yêu cầu AI tạo lại đáp án mới"
                >
                  <RefreshCw className="w-3 h-3 text-slate-400" />
                  <span>Thử lại</span>
                </button>
              )}
            </div>

            {onSelectForLogs && (message.spawningScore !== undefined || (message.multiAgentLogs && message.multiAgentLogs.length > 0)) && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onSelectForLogs}
                  className={cn(
                    "flex items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 border active:scale-95 cursor-pointer",
                    isSelectedForLogs
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-cyan-500/30 text-blue-600 dark:text-cyan-400"
                      : "bg-transparent border-slate-200/60 dark:border-blue-500/15 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162644]"
                  )}
                  title="Đồng bộ hóa vết xử lý sang Console Debugger"
                >
                  <Cpu className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                  <span>{isSelectedForLogs ? "Đang đồng bộ Console" : "Đồng bộ Console"}</span>
                </button>

                <button
                  onClick={() => setShowTrace(!showTrace)}
                  className={cn(
                    "flex items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 border active:scale-95 cursor-pointer",
                    showTrace
                      ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400"
                      : "bg-transparent border-slate-200/60 dark:border-blue-500/15 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162644]"
                  )}
                  title="Hiện nhật ký giải trình xử lý Multi-Agent inline"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
                  <span>{showTrace ? "Ẩn vết" : "Vết xử lý"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {!isUser && (message.spawningScore !== undefined || (message.multiAgentLogs && message.multiAgentLogs.length > 0)) && (
          <div className="w-full mt-2.5 pt-1">
            <button
              onClick={() => setShowTrace(!showTrace)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
            >
              <Cpu className={cn("w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400", hasRunningLogs && "animate-pulse")} />
              <span>Nhật ký xử lý AI ({didSpawn ? "Multi-Agent" : "Single-Agent"})</span>
              {hasRunningLogs && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400 text-xs font-bold rounded animate-pulse">
                  Đang chạy...
                </span>
              )}
              {showTrace ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {showTrace && (
              <div className="mt-2 space-y-3 text-xs text-slate-600 dark:text-slate-400 border-l-2 border-indigo-200 dark:border-indigo-500/20 pl-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>Khởi tạo Agent</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-xs font-semibold",
                      didSpawn 
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" 
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      S-Score: {score.toFixed(3)}
                    </span>
                  </div>
                  {breakdown && Object.keys(breakdown).length > 0 && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-400 pt-1">
                      <div>Độ phức tạp câu hỏi: <span className="font-semibold text-slate-600 dark:text-slate-300">{(breakdown.c_ratio || 0).toFixed(2)}</span></div>
                      <div>Độ dài ngữ cảnh: <span className="font-semibold text-slate-600 dark:text-slate-300">{(breakdown.d_intent || 0).toFixed(1)}</span></div>
                    </div>
                  )}
                </div>

                {consolidation && (
                  <div className="space-y-0.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 font-bold text-slate-500">
                        <Layers className="w-3 h-3 text-orange-500" /> Nén RAG:
                      </span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">{consolidation.consolidated_tokens} / {consolidation.raw_tokens} tokens ({consolidation.compression_ratio}% nén)</span>
                    </div>
                  </div>
                )}

                {/* 3. Sub-agents timeline */}
                {logs.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Trình tự Sub-Agent:</div>
                    <div className="space-y-1.5">
                      {logs.map((log) => {
                        const logExpanded = expandedLogs[log.subagentId] ?? true;
                        const isRunning = log.status === "running";
                        const isCompleted = log.status === "completed";
                        const isFailed = log.status === "failed";

                        return (
                          <div key={log.subagentId} className="space-y-1">
                            <button
                              onClick={() => toggleLog(log.subagentId)}
                              className="w-full flex items-center justify-between hover:text-blue-600 dark:hover:text-cyan-400 text-left transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-2 h-2 rounded-full flex-shrink-0",
                                  isRunning && "bg-blue-500 animate-pulse",
                                  isCompleted && "bg-emerald-500",
                                  isFailed && "bg-rose-500"
                                )} />
                                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs font-mono">{log.role}</span>
                                <span className="text-xs text-slate-400 truncate max-w-[180px]">{log.task}</span>
                              </div>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-xs font-bold uppercase font-mono",
                                isRunning && "text-blue-600 dark:text-cyan-400 animate-pulse",
                                isCompleted && "text-emerald-600 dark:text-emerald-400",
                                isFailed && "text-rose-600 dark:text-rose-400"
                              )}>
                                {isRunning ? "Running" : isCompleted ? "Done" : "Failed"}
                              </span>
                            </button>

                            {logExpanded && log.thinking && (
                              <div className="ml-4 pl-2 border-l border-slate-200 dark:border-blue-500/20 text-cyan-400 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto scrollbar-thin">
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

                {/* 4. Critique Report */}
                {critique && (
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 font-bold text-slate-500">
                        <Sparkles className="w-3 h-3 text-purple-500" /> Critique:
                      </span>
                      <span className={cn(
                        "font-bold uppercase text-xs",
                        critique.verdict === "approve" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {critique.verdict === "approve" ? "Đã thông qua" : "Cần sửa đổi"}
                      </span>
                    </div>
                    {critique.critique_report && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {critique.critique_report}
                      </p>
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
        {uiComponents.map((component, index) => (
          <WidgetRenderer key={`${component.component}-${index}`} data={component} />
        ))}

        {/* HITL widget (reuses WidgetRenderer if ui_instruction present) */}
        {message.hitlRequest?.ui_instruction && (
          <WidgetRenderer data={message.hitlRequest.ui_instruction} />
        )}

        {/* Generic approval is used for navigation/future actions. Draft widgets
            retain their own edit-and-save flow to prevent accidental writes. */}
        {message.hitlRequest && !message.hitlRequest.ui_instruction && (
          <ActionApprovalCard
            request={message.hitlRequest}
            onApprove={onActionApprove}
            onReject={onActionReject}
          />
        )}
      </div>


    </div>
  );
});
