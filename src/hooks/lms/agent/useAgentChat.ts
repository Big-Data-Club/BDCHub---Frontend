"use client";

/**
 * useAgentChat - SSE stream parser and chat state manager.
 *
 * Connects to the agent SSE endpoint, parses events in real-time,
 * and maintains the message list with streaming text, tool activities,
 * clarifications, and dynamic UI widgets.
 */
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { agentService } from "@/services/ai/agentService";
import type {
  AgentMessage,
  AgentEvent,
  ToolActivity,
  AgentHistoryMessage,
  UIComponentData,
} from "@/types";

let _msgIdCounter = 0;
function nextId(): string {
  return `msg-${Date.now()}-${++_msgIdCounter}`;
}

function normalizeUIComponents(value: unknown, legacy?: unknown): UIComponentData[] {
  const isComponent = (item: unknown): item is UIComponentData =>
    !!item && typeof item === "object" && typeof (item as UIComponentData).component === "string";
  if (Array.isArray(value)) return value.filter(isComponent);
  if (isComponent(value)) return [value];
  return isComponent(legacy) ? [legacy] : [];
}

// Context travels with every streamed turn. Keep it bounded so a long lesson
// cannot turn a simple follow-up into a slow, oversized request.
function compactPageContext(context?: Record<string, any> | null): Record<string, any> | undefined {
  if (!context) return undefined;
  const body = String(context.contentBody ?? context.content_body ?? "");
  const extra = context.extra && typeof context.extra === "object"
    ? Object.fromEntries(
        Object.entries(context.extra)
          .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
          .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 300) : value]),
      )
    : undefined;

  return {
    pageType: context.pageType,
    route: context.route,
    courseId: context.courseId,
    courseName: context.courseName,
    sectionId: context.sectionId,
    sectionName: context.sectionName,
    contentId: context.contentId,
    contentTitle: context.contentTitle,
    contentType: context.contentType,
    ...(body ? { contentBody: body.slice(0, 12_000) } : {}),
    ...(extra && Object.keys(extra).length ? { extra } : {}),
  };
}

/**
 * Deterministic last-resort context derived from the URL itself.
 *
 * Covers the window where a page has not declared its context yet
 * (course data still loading) or simply forgot to call setPageContext:
 * `/lms/student/courses/23/learn?contentId=2270` already tells us
 * course_id=23 + content_id=2270 without asking the backend to guess.
 * Real pageContext always wins when present; this only fills the gaps.
 */
function deriveContextFromPath(pathname: string | null): Record<string, any> | undefined {
  if (!pathname || typeof window === "undefined") return undefined;
  const match = pathname.match(/^\/lms\/(student|teacher)\/courses\/(\d+)(?:\/([a-z-]+))?/);
  if (!match) return undefined;
  const [, area, courseId, sub] = match;

  // Read deep-link params straight from the address bar. Avoids
  // useSearchParams() so lazy chat UIs stay free of Suspense constraints.
  let contentId: number | undefined;
  try {
    const param = new URLSearchParams(window.location.search).get("contentId");
    contentId = param && /^\d+$/.test(param) ? Number(param) : undefined;
  } catch {
    contentId = undefined;
  }

  return {
    pageType: sub === "learn" ? "lesson" : "course_detail",
    route: pathname,
    courseId: Number(courseId),
    ...(contentId ? { contentId } : {}),
    source: `url_fallback:${area}`,
  };
}

interface UseAgentChatOptions {
  agentType: "teacher" | "mentor";
  courseId?: number;
  initialSessionId?: string;
  initialMessages?: AgentMessage[];
  userId?: number;
  /** Structured in-page context fed by the ChatSidebar. */
  pageContext?: Record<string, any> | null;
  /**
   * Out-of-band context invisibly stitched into the agent's system
   * prompt - used by the Quick Action Panel "Ask AI" button so the
   * model knows exactly which micro-lesson the student is reading.
   */
  systemContext?: Record<string, any> | null;
  onSessionUpdated?: (update: {
    sessionId: string;
    title?: string;
    reason: "title" | "new" | "reused" | "activity";
  }) => void;
}

export function useAgentChat({ agentType, courseId, initialSessionId, initialMessages, userId, pageContext, systemContext, onSessionUpdated }: UseAgentChatOptions) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<AgentMessage[]>(initialMessages || []);
  // Do not initialise from the URL directly.  The effect below owns the first
  // load and records the URL it consumed; otherwise clicking B while the URL
  // still says A briefly makes the hook switch straight back to A.
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const processEventRef = useRef<any>(null);
  const consumedUrlSessionRef = useRef<string | undefined>(undefined);

  // Page context declared by the page, gap-filled by the URL fallback so the
  // agent always knows which course the user is standing in (e.g. while the
  // course payload is still loading, or on pages that never declared one).
  const urlFallbackContext = useMemo(() => deriveContextFromPath(pathname), [pathname]);
  const effectivePageContext = useMemo(
    () => (urlFallbackContext ? { ...urlFallbackContext, ...(pageContext || {}) } : pageContext || undefined),
    [urlFallbackContext, pageContext],
  );
  const effectiveCourseId =
    courseId ?? (effectivePageContext?.courseId != null ? Number(effectivePageContext.courseId) : undefined);

  const loadHistory = useCallback(async (sid: string) => {
    setIsLoadingHistory(true);
    try {
      const history: AgentHistoryMessage[] = await agentService.getSessionMessages(sid);
      const mappedMessages: AgentMessage[] = history.map((m) => ({
        id: m.id,
        dbId: Number(m.id) || undefined,
        role: m.role as any,
        content: m.content || "",
        timestamp: new Date(m.created_at).getTime(),
        toolActivities: m.metadata?.toolActivities || [],
        uiComponents: normalizeUIComponents(m.metadata?.uiComponents, m.metadata?.uiComponent),
        hitlRequest: m.metadata?.hitlRequest,
        context: m.metadata?.context,
        thinking: m.metadata?.thinking || "",
        references: m.metadata?.references || [],
        model: (m.metadata as any)?.model || undefined,
        incomplete: Boolean((m.metadata as any)?.incomplete),
        multiAgentLogs: (m.metadata as any)?.multiAgentLogs || [],
        critiqueReport: (m.metadata as any)?.critiqueReport,
        consolidation: (m.metadata as any)?.consolidation,
        spawningScore: (m.metadata as any)?.spawningScore,
        spawningBreakdown: (m.metadata as any)?.spawningBreakdown,
      }));
      setMessages(mappedMessages);
    } catch (err) {
      console.error("Failed to load session history:", err);
      if (initialMessages && initialMessages.length > 0 && sid === initialSessionId) {
        setMessages(initialMessages);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, [initialMessages, initialSessionId]);

  /**
   * Abort the current SSE stream.
   */
  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setIsThinking(false);
  }, []);

  const switchSession = useCallback(async (newSessionId: string) => {
    stopStreaming();
    setSessionId(newSessionId);
    if (!initialMessages || newSessionId !== initialSessionId) {
      setMessages([]);
    }
    await loadHistory(newSessionId);
  }, [stopStreaming, initialMessages, initialSessionId, loadHistory]);

  // Load history only when the URL itself changes.  A local sidebar click
  // changes state before AgentChatPanel has time to replace the query string;
  // treating that stale URL as authoritative caused A -> B -> A redirect loops.
  useEffect(() => {
    if (initialSessionId && initialSessionId !== consumedUrlSessionRef.current) {
      consumedUrlSessionRef.current = initialSessionId;
      if (initialSessionId === sessionId && messages.length > 0) return;
      switchSession(initialSessionId);
    }
  }, [initialSessionId, sessionId, switchSession, messages.length]);

  const startNewChat = useCallback(async () => {
    stopStreaming();
    if (sessionId === null && messages.length === 0) {
      return;
    }
 
    if (!userId) {
      setSessionId(null);
      setMessages([]);
      return;
    }
 
    try {
      const res = await agentService.createNewSession({
        agent_type: agentType,
        course_id: effectiveCourseId,
      });
      setSessionId(res.session_id);
      setMessages([]);
      onSessionUpdated?.({
        sessionId: res.session_id,
        reason: res.reused ? "reused" : "new",
      });
    } catch (err) {
      console.error("Failed to start entirely new chat:", err);
      setSessionId(null);
      setMessages([]);
    }
  }, [agentType, effectiveCourseId, userId, sessionId, messages.length, onSessionUpdated, stopStreaming]);

  /**
   * Send a message and process the SSE stream.
   */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      // Add user message
      const userMsg: AgentMessage = {
        id: nextId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      // Add placeholder assistant message
      const assistantMsg: AgentMessage = {
        id: nextId(),
        role: "assistant",
        content: "",
        isStreaming: true,
        timestamp: Date.now(),
        thinkingSteps: [],
        toolActivities: [],
        thinking: "",
        references: [],
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      setIsThinking(true);

      const assistantId = assistantMsg.id;

      try {
        abortRef.current = new AbortController();
        const requestPageContext = compactPageContext(effectivePageContext);

        const response = await fetch("/api/ai/agents/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            agent_type: agentType,
            course_id: effectiveCourseId,
            session_id: sessionId,
            ...(requestPageContext ? { page_context: requestPageContext } : {}),
            ...(systemContext ? { system_context: systemContext } : {}),
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last potentially-incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let event: AgentEvent;
            try {
              event = JSON.parse(raw);
            } catch {
              continue;
            }

            processEventRef.current?.(event, assistantId);
          }
        }

        // Process any remaining buffer
        if (buffer.startsWith("data: ")) {
          const raw = buffer.slice(6).trim();
          if (raw) {
            try {
              processEventRef.current?.(JSON.parse(raw), assistantId);
            } catch {
              /* ignore */
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          updateAssistant(assistantId, (msg) => ({
            ...msg,
            content:
              msg.content || "Đã xảy ra lỗi kết nối. Vui lòng thử lại.",
            isStreaming: false,
          }));
        }
      } finally {
        setIsStreaming(false);
        setIsThinking(false);
        abortRef.current = null;

        // Ensure streaming flag is cleared
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          isStreaming: false,
        }));
      }
    },
    [agentType, effectiveCourseId, sessionId, isStreaming, effectivePageContext, systemContext],
  );

  /**
   * Process a single SSE event and update the assistant message.
   */
  function processEvent(event: AgentEvent, assistantId: string) {
    switch (event.type) {
      case "session":
        setSessionId(event.data.session_id);
        if (event.data.is_new) {
          onSessionUpdated?.({
            sessionId: event.data.session_id,
            reason: "new",
          });
        }
        break;

      case "title_update":
        if (event.data.title) {
          onSessionUpdated?.({
            sessionId: event.session_id,
            title: event.data.title,
            reason: "title",
          });
        }
        break;

      case "thinking":
        setIsThinking(true);
        updateAssistant(assistantId, (msg) => {
          const delta = event.data.delta || "";
          const step = event.data.step;
          let extra: Partial<AgentMessage> = {};
          if (step === "multi_agent_decision") {
            extra = {
              spawningScore: event.data.score,
              spawningBreakdown: event.data.breakdown,
            };
          }
          return {
            ...msg,
            ...extra,
            thinking: (msg.thinking || "") + delta,
            thinkingSteps: [
              ...(msg.thinkingSteps || []),
              {
                step: event.data.step || "thinking",
                detail: event.data.intent || event.data.token_estimate?.toString() || event.data.detail,
              },
            ],
          };
        });
        break;

      case "context":
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          context: event.data as any,
        }));
        break;

      case "subagent_spawn":
        updateAssistant(assistantId, (msg) => {
          const logs = msg.multiAgentLogs || [];
          if (logs.some((l) => l.subagentId === event.data.subagent_id)) {
            return msg;
          }
          return {
            ...msg,
            multiAgentLogs: [
              ...logs,
              {
                subagentId: event.data.subagent_id,
                role: event.data.role,
                task: event.data.task,
                status: "running",
                thinking: "",
              },
            ],
          };
        });
        break;

      case "subagent_thinking":
        updateAssistant(assistantId, (msg) => {
          const logs = msg.multiAgentLogs || [];
          return {
            ...msg,
            multiAgentLogs: logs.map((l) =>
              l.subagentId === event.data.subagent_id
                ? { ...l, thinking: l.thinking + (event.data.delta || "") }
                : l
            ),
          };
        });
        break;

      case "subagent_done":
        updateAssistant(assistantId, (msg) => {
          const logs = msg.multiAgentLogs || [];
          return {
            ...msg,
            multiAgentLogs: logs.map((l) =>
              l.subagentId === event.data.subagent_id
                ? { ...l, status: "completed", summary: event.data.summary }
                : l
            ),
          };
        });
        break;

      case "subagent_error":
        updateAssistant(assistantId, (msg) => {
          const logs = msg.multiAgentLogs || [];
          return {
            ...msg,
            multiAgentLogs: logs.map((l) =>
              l.subagentId === event.data.subagent_id
                ? { ...l, status: "failed", error: event.data.error }
                : l
            ),
          };
        });
        break;

      case "critique_phase":
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          critiqueReport: {
            factuality_score: event.data.factuality_score,
            pedagogy_score: event.data.pedagogy_score,
            format_score: event.data.format_score,
            verdict: event.data.verdict,
            critique_report: event.data.critique_report,
          },
        }));
        break;

      case "context_consolidation":
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          consolidation: {
            raw_tokens: event.data.raw_tokens,
            consolidated_tokens: event.data.consolidated_tokens,
            compression_ratio: event.data.compression_ratio,
          },
        }));
        break;

      case "text_delta":
        setIsThinking(false);
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          content: msg.content + (event.data.delta || ""),
        }));
        break;

      case "text_reset":
        // Multi-agent revision/fallback: discard the streamed draft so the
        // corrected answer replaces it instead of appending.
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          content: "",
        }));
        break;

      case "tool_start":
        setIsThinking(false);
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          toolActivities: [
            ...(msg.toolActivities || []),
            {
              tool: event.data.tool,
              status: "running" as const,
              args: event.data.args,
            },
          ],
        }));
        break;

      case "tool_result":
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          toolActivities: (msg.toolActivities || []).map((t) =>
            t.tool === event.data.tool
              ? {
                  ...t,
                  status: (event.data.status === "error"
                    ? "error"
                    : "done") as ToolActivity["status"],
                  message: event.data.message,
                }
              : t,
          ),
        }));
        break;

      case "ui_component":
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          uiComponents: [...normalizeUIComponents(msg.uiComponents, msg.uiComponent), ...normalizeUIComponents(event.data)],
        }));
        break;

      case "clarification":
        setIsThinking(false);
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          content: event.data.question || msg.content,
          clarification: event.data as any,
          isStreaming: false,
        }));
        break;

      case "hitl_request":
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          hitlRequest: event.data as any,
        }));
        break;

      case "done":
        setIsThinking(false);
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          isStreaming: false,
          references: event.data.references || msg.references,
          model: event.data.model || msg.model,
          incomplete: Boolean(event.data.incomplete),
          dbId: event.data.message_id ? Number(event.data.message_id) : msg.dbId,
        }));
        if (event.session_id) {
          onSessionUpdated?.({
            sessionId: event.session_id,
            reason: "activity",
          });
        }
        break;

      case "error":
        setIsThinking(false);
        updateAssistant(assistantId, (msg) => ({
          ...msg,
          content:
            msg.content || event.data.error || "Đã xảy ra lỗi.",
          isStreaming: false,
        }));
        break;
    }
  }

  useEffect(() => {
    processEventRef.current = processEvent;
  });

  function updateAssistant(
    id: string,
    updater: (msg: AgentMessage) => AgentMessage,
  ) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? updater(m) : m)),
    );
  }

  const deleteSession = useCallback(async (sid: string) => {
    try {
      await agentService.deleteSession(sid);
      if (sid === sessionId) {
        setSessionId(null);
        setMessages([]);
      }
      onSessionUpdated?.({
        sessionId: sid,
        reason: "new",
      });
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  }, [sessionId, onSessionUpdated]);

  const renameSession = useCallback(async (sid: string, title: string) => {
    try {
      await agentService.renameSession(sid, title);
      onSessionUpdated?.({
        sessionId: sid,
        title,
        reason: "title",
      });
    } catch (err) {
      console.error("Failed to rename session:", err);
    }
  }, [onSessionUpdated]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return {
    messages,
    sessionId,
    isStreaming,
    isThinking,
    isLoadingHistory,
    sendMessage,
    stopStreaming,
    clearChat,
    switchSession,
    startNewChat,
    deleteSession,
    renameSession,
  };
}
