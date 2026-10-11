"use client";
import { BellRing, AlignLeft, CornerDownLeft, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useChat } from "@/hooks/chat/useChat";
import { DEFAULT_CHAT_PREFERENCES } from "@/constants/chat/preferences";

export function ChatSettingsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { preferences, updatePreferences } = useChat();
  const options = [
    { key: "sound" as const, icon: BellRing, title: "Âm báo tin nhắn", description: "Phát âm báo khi có tin nhắn mới ở tab nền." },
    { key: "compact" as const, icon: AlignLeft, title: "Hiển thị gọn", description: "Giảm khoảng cách để đọc nhiều tin nhắn hơn." },
    { key: "enterToSend" as const, icon: CornerDownLeft, title: "Enter để gửi", description: "Tắt để Enter xuống dòng. Ctrl/⌘ + Enter luôn gửi." },
  ];
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="border-border bg-card text-foreground rounded-2xl sm:max-w-md">
      <DialogHeader>
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400"><SlidersHorizontal className="h-5 w-5" /></div>
        <DialogTitle className="text-xl">Chat theo cách của bạn</DialogTitle>
        <DialogDescription className="text-muted-foreground">Tùy chọn được lưu tự động cho tài khoản trên trình duyệt này.</DialogDescription>
      </DialogHeader>
      <div className="divide-y divide-border">
        {options.map(({ key, icon: Icon, title, description }) => <div key={key} className="flex items-start gap-3 py-4">
          <Icon className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1"><label htmlFor={`chat-${key}`} className="cursor-pointer text-sm font-semibold">{title}</label><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p></div>
          <Switch id={`chat-${key}`} checked={preferences[key]} onCheckedChange={(checked) => updatePreferences({ [key]: checked })} className="data-[state=checked]:bg-blue-600" />
        </div>)}
      </div>
      <button onClick={() => updatePreferences(DEFAULT_CHAT_PREFERENCES)} className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted active:scale-95"><RotateCcw className="h-4 w-4" />Khôi phục mặc định</button>
    </DialogContent>
  </Dialog>;
}
