"use client";

/**
 * Student AI Mentor - chat page.
 * Full-height chat panel with mentor agent for learning assistance.
 */
import { useSearchParams } from "next/navigation";
import { AgentChatPanel } from "@/components/lms/agent/AgentChatPanel";
import type { AgentMessage } from "@/types";

interface AIMentorPageProps {
  initialMessages?: AgentMessage[];
  initialSessions?: any[];
}

export default function AIMentorPage({
  initialMessages,
  initialSessions,
}: AIMentorPageProps = {}) {
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
        initialMessages={initialMessages}
        initialSessions={initialSessions}
        className="h-full"
      />
    </div>
  );
}

