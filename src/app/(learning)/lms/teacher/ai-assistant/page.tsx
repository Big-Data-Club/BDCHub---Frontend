"use client";

/**
 * Teacher AI Assistant - chat page.
 * Full-height chat panel with teacher agent for course management support.
 */
import { useSearchParams } from "next/navigation";
import { AgentChatPanel } from "@/components/lms/agent/AgentChatPanel";

export default function AIAssistantPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId")
    ? Number(searchParams.get("courseId"))
    : undefined;
  const sessionId = searchParams.get("sessionId") || undefined;

  return (
    <div className="w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden">
      <AgentChatPanel
        agentType="teacher"
        courseId={courseId}
        sessionId={sessionId}
        className="h-full w-full"
      />
    </div>
  );
}
