"use client";

/**
 * Student AI Mentor - chat page.
 * Full-height chat panel with mentor agent for learning assistance.
 */
import { useSearchParams } from "next/navigation";
import { AgentChatPanel } from "@/components/lms/agent/AgentChatPanel";
import type { AgentMessage, AgentSession } from "@/types";

interface AIMentorPageProps {
  initialMessages?: AgentMessage[];
  initialSessions?: AgentSession[];
  defaultConsoleOpen?: boolean;
  initialSelectedMessageId?: string;
}

export default function AIMentorPage({
  initialMessages,
  initialSessions,
  defaultConsoleOpen = false,
  initialSelectedMessageId,
}: AIMentorPageProps = {}) {
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
        initialMessages={initialMessages}
        initialSessions={initialSessions}
        defaultConsoleOpen={defaultConsoleOpen}
        initialSelectedMessageId={initialSelectedMessageId}
        className="h-full w-full"
      />
    </div>
  );
}

