"use client";

import { cn } from "@/lib/utils";
import { Bot, User, Wrench, Check, AlertCircle } from "lucide-react";
import type { AgentMessage } from "@/types";
import { AgentThinkingIndicator } from "./AgentThinkingIndicator";
import { ClarificationCard } from "./ClarificationCard";
import { WidgetRenderer } from "./WidgetRenderer";

interface AgentMessageBubbleProps {
  message: AgentMessage;
  onClarificationSelect?: (option: string) => void;
}

export function AgentMessageBubble({
  message,
  onClarificationSelect,
}: AgentMessageBubbleProps) {
  const isUser = message.role === "user";

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
            "flex items-center justify-center",
            "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
          )}
        >
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] space-y-1",
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
                  "flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg",
                  "bg-slate-100 dark:bg-slate-800",
                  "text-slate-500 dark:text-slate-500",
                )}
              >
                {t.status === "running" ? (
                  <Wrench className="w-3 h-3 animate-spin" />
                ) : t.status === "error" ? (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                ) : (
                  <Check className="w-3 h-3 text-green-500" />
                )}
                <span className="font-medium">{t.tool}</span>
                {t.message && <span className="text-slate-400">— {t.message}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Thinking indicator */}
        {!isUser && message.isStreaming && !message.content && (
          <AgentThinkingIndicator steps={message.thinkingSteps} />
        )}

        {/* Message bubble */}
        {message.content && (
          <div
            className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed",
              "whitespace-pre-wrap break-words",
              isUser
                ? "bg-blue-600 text-white rounded-br-md"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-md",
            )}
          >
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-blue-500 dark:bg-blue-400 ml-0.5 animate-pulse rounded-sm" />
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
            "flex items-center justify-center",
            "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
          )}
        >
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
