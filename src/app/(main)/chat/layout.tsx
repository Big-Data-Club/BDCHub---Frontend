import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat - Big Data Club",
  description: "Kênh chat realtime của Big Data Club. Trao đổi, thảo luận cùng các thành viên.",
};

// This layout wraps the chat page with a full-height, no-padding container.
// The main layout renders <main className="flex-1 p-4 ..."> which adds padding.
// We use negative margins to cancel it out, giving chat a true full viewport height.
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100dvh-8rem)] min-h-[28rem] overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:h-[calc(100dvh-4rem)]">
      {children}
    </div>
  );
}
