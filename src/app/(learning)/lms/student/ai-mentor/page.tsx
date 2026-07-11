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
    <div className="h-[calc(100dvh-6.5rem)] lg:h-[calc(100vh-10rem)] px-4 sm:px-6 lg:px-8 py-6 w-full">
      <AgentChatPanel
        agentType="mentor"
        courseId={courseId}
        sessionId={sessionId}
        className="h-full"
      />
    </div>
  );
}
