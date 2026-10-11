import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat - Big Data Club",
  description: "Kênh chat realtime của Big Data Club. Trao đổi, thảo luận cùng các thành viên.",
};

// Keep the application shell spacing and fit chat into the remaining viewport.
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100dvh-8rem)] min-h-[28rem] overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:h-[calc(100dvh-4rem)]">
      {children}
    </div>
  );
}
