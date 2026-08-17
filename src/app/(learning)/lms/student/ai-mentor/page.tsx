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
    <div className="w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
      <AgentChatPanel
        agentType="mentor"
        courseId={courseId}
        sessionId={sessionId}
        defaultConsoleOpen={false}
        className="h-full w-full"
      />
    </div>
  );
}
