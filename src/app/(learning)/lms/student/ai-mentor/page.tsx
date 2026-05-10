"use client";

/**
 * Student AI Mentor — chat page.
 * Full-height chat panel with mentor agent for learning assistance.
 */
import { useSearchParams } from "next/navigation";
import { AgentChatPanel } from "@/components/lms/agent/AgentChatPanel";

export default function AIMentorPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId")
    ? Number(searchParams.get("courseId"))
    : undefined;

  return (
    <div className="h-[calc(100vh-10rem)]">
      <AgentChatPanel
        agentType="mentor"
        courseId={courseId}
        className="h-full"
      />
    </div>
  );
}
