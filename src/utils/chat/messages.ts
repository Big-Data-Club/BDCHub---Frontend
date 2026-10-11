import type { ChatMessage } from "@/types/chat/chat";

export const MESSAGE_CACHE_LIMIT = 500;

/** Stable server-id ordering also reconciles HTTP/WS duplicates and replay. */
export function mergeMessages(current: ChatMessage[], incoming: ChatMessage[], limit = MESSAGE_CACHE_LIMIT): ChatMessage[] {
  const entries = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => entries.set(message.id, { ...entries.get(message.id), ...message }));
  return [...entries.values()].sort((a, b) => a.id - b.id).slice(-limit);
}

export function chatWebSocketUrl(origin: string, token: string, configuredBase?: string): string {
  const base = configuredBase || `${origin}/chatapiv1`;
  const url = new URL(`${base.replace(/\/$/, "")}/chat/ws`, origin);
  url.protocol = url.protocol === "https:" || url.protocol === "wss:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
}
