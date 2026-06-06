"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, User, Wrench, Check, AlertCircle, ChevronDown, ChevronRight, BookOpen, Globe } from "lucide-react";
import type { AgentMessage } from "@/types";
import { AgentThinkingIndicator } from "./AgentThinkingIndicator";
import { ClarificationCard } from "./ClarificationCard";
import { WidgetRenderer } from "./WidgetRenderer";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";

interface AgentMessageBubbleProps {
  message: AgentMessage;
  onClarificationSelect?: (option: string) => void;
}

export function AgentMessageBubble({
  message,
  onClarificationSelect,
}: AgentMessageBubbleProps) {
  const isUser = message.role === "user";
  const [showThinking, setShowThinking] = useState(false);
  const [showReferences, setShowReferences] = useState(false);

  // Auto-expand thinking box when streaming thinking delta
  useEffect(() => {
    if (message.isStreaming && message.thinking && !message.content) {
      setShowThinking(true);
    }
  }, [message.isStreaming, message.thinking, message.content]);

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
              "px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm",
              isUser
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-br-sm shadow-blue-500/5 whitespace-pre-wrap break-words"
                : "bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-slate-200 rounded-bl-sm backdrop-blur-sm",
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
