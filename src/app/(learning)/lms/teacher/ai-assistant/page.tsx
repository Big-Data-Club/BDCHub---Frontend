"use client";

/**
 * Teacher AI Assistant — chat page.
 * Full-height chat panel with teacher agent for course management support.
 */
import { useSearchParams } from "next/navigation";
import { AgentChatPanel } from "@/components/lms/agent/AgentChatPanel";

export default function AIAssistantPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId")
    ? Number(searchParams.get("courseId"))
    : undefined;

  return (
    <div className="h-[calc(100vh-10rem)]">
      <AgentChatPanel
        agentType="teacher"
        courseId={courseId}
        className="h-full"
      />
    </div>
  );
}
