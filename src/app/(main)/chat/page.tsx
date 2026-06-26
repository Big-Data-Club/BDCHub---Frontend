"use client";

import { Suspense } from "react";
import { ChatProvider } from "@/hooks/useChat";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatPanel from "@/components/chat/ChatPanel";

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-sm font-medium">Đang tải tin nhắn...</span>
        </div>
      </div>
    }>
      <ChatProvider>
        {/* Slack-style: channel list | message panel - fills the layout container */}
        <div className="flex h-full overflow-hidden">
          <ChatSidebar />
          <ChatPanel />
        </div>
      </ChatProvider>
    </Suspense>
  );
}

