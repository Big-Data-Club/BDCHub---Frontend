"use client";
import { Loader2, MessageSquare, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useChatUserSearch } from "@/hooks/chat/useChatUserSearch";
import type { ChatChannel } from "@/types/chat/chat";
import ChatAvatar from "./ChatAvatar";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChannel: (id: number) => void;
  onAddChannelToList: (channel: ChatChannel) => void;
}

export default function UserSearchModal({ isOpen, onClose, onSelectChannel, onAddChannelToList }: UserSearchModalProps) {
  const { query, setQuery, users, loading, submittingUserId, error, selectUser } = useChatUserSearch(isOpen, (channel) => {
    onAddChannelToList(channel); onSelectChannel(channel.id); onClose();
  });
  return <Dialog open={isOpen} onOpenChange={(open) => { if (!open && submittingUserId === null) onClose(); }}>
    <DialogContent className="rounded-2xl border-border bg-card text-foreground sm:max-w-md">
      <DialogHeader><DialogTitle>Cuộc trò chuyện mới</DialogTitle><DialogDescription className="text-muted-foreground">Tìm một thành viên để bắt đầu trao đổi riêng.</DialogDescription></DialogHeader>
      <label className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-3"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input aria-label="Tìm thành viên" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên hoặc email…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />{loading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}</label>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="max-h-[50vh] min-h-40 overflow-y-auto">
        {!query.trim() ? <p className="px-4 py-12 text-center text-sm text-muted-foreground">Nhập tên hoặc email để tìm thành viên.</p> : !loading && !users.length && !error ? <p className="px-4 py-12 text-center text-sm text-muted-foreground">Không tìm thấy thành viên phù hợp.</p> : <ul className="space-y-1">{users.map((user) => <li key={user.id}><button disabled={submittingUserId !== null} onClick={() => void selectUser(user)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-muted disabled:opacity-60"><ChatAvatar name={user.fullName} src={user.profilePicture} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.fullName}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>{submittingUserId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4 text-muted-foreground" />}</button></li>)}</ul>}
      </div>
    </DialogContent>
  </Dialog>;
}
