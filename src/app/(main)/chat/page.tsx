"use client";

import { ChatProvider } from "@/hooks/useChat";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatPanel from "@/components/chat/ChatPanel";

export default function ChatPage() {
  return (
    <ChatProvider>
      {/* Slack-style: channel list | message panel — fills the layout container */}
      <div className="flex h-full overflow-hidden">
        <ChatSidebar />
        <ChatPanel />
      </div>
    </ChatProvider>
  );
}
