"use client";

/**
 * useAgentChat - SSE stream parser and chat state manager.
 *
 * Connects to the agent SSE endpoint, parses events in real-time,
 * and maintains the message list with streaming text, tool activities,
 * clarifications, and dynamic UI widgets.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { agentService } from "@/services/agentService";
import type {
  AgentMessage,
  AgentEvent,
  ToolActivity,
  AgentHistoryMessage,
} from "@/types";

let _msgIdCounter = 0;
function nextId(): string {
  return `msg-${Date.now()}-${++_msgIdCounter}`;
}

interface UseAgentChatOptions {
  agentType: "teacher" | "mentor";
  courseId?: number;
  initialSessionId?: string;
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
 
export function useAgentChat({ agentType, courseId, initialSessionId, userId, pageContext, systemContext, onSessionUpdated }: UseAgentChatOptions) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load history when session changes externally
  useEffect(() => {
    if (initialSessionId && initialSessionId !== sessionId) {
      switchSession(initialSessionId);
    }
  }, [initialSessionId]);

  const loadHistory = async (sid: string) => {
    setIsLoadingHistory(true);
    try {
      const history: AgentHistoryMessage[] = await agentService.getSessionMessages(sid);
      const mappedMessages: AgentMessage[] = history.map((m) => ({
        id: m.id,
        role: m.role as any,
        content: m.content || "",
        timestamp: new Date(m.created_at).getTime(),
        toolActivities: m.metadata?.toolActivities || [],
        uiComponent: m.metadata?.uiComponent,
        hitlRequest: m.metadata?.hitlRequest,
        thinking: m.metadata?.thinking || "",
        references: m.metadata?.references || [],
        multiAgentLogs: (m.metadata as any)?.multiAgentLogs || [],
        critiqueReport: (m.metadata as any)?.critiqueReport,
        consolidation: (m.metadata as any)?.consolidation,
        spawningScore: (m.metadata as any)?.spawningScore,
        spawningBreakdown: (m.metadata as any)?.spawningBreakdown,
      }));
      setMessages(mappedMessages);
    } catch (err) {
      console.error("Failed to load session history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

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
    setMessages([]);
    await loadHistory(newSessionId);
  }, [stopStreaming]);

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
        course_id: courseId,
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
  }, [agentType, courseId, userId, sessionId, messages.length, onSessionUpdated]);

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

        const response = await fetch("/api/ai/agents/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            agent_type: agentType,
            course_id: courseId,
            session_id: sessionId,
            ...(pageContext ? { page_context: pageContext } : {}),
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

            processEvent(event, assistantId);
          }
        }

        // Process any remaining buffer
        if (buffer.startsWith("data: ")) {
          const raw = buffer.slice(6).trim();
          if (raw) {
            try {
              processEvent(JSON.parse(raw), assistantId);
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
    [agentType, courseId, sessionId, isStreaming, pageContext, systemContext],
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
          uiComponent: event.data as any,
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
