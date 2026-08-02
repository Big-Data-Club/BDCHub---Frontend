"use client";

/**
 * Student AI Mentor - chat page.
 * Full-height chat panel with mentor agent for learning assistance.
 */
import { useSearchParams } from "next/navigation";
import { AgentChatPanel } from "@/components/lms/agent/AgentChatPanel";

export default function AIMentorPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId")
    ? Number(searchParams.get("courseId"))
    : undefined;
  const sessionId = searchParams.get("sessionId") || undefined;

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex-1 overflow-hidden">
      <AgentChatPanel
        agentType="mentor"
        courseId={courseId}
        sessionId={sessionId}
        className="h-full"
      />
    </div>
  );
}
