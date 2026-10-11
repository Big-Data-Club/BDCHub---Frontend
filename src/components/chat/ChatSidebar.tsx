"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Hash, Lock, Plus, MessageSquare, Settings2, Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import { useChat } from "@/hooks/chat/useChat";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/auth/useAuth";
import UserSearchModal from "./UserSearchModal";
import ChatAvatar from "./ChatAvatar";
import { ChatSettingsModal } from "./modals/ChatSettingsModal";

export default function ChatSidebar() {
  const { channels, channelsLoading, activeChannelId, setActiveChannelId, unreadCounts, addChannel,
    showSidebar, connectionState, refreshChannels } = useChat();
  const { isAdmin } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const filtered = useMemo(() => channels.filter((channel) =>
    `${channel.name} ${channel.description} ${channel.dmUser?.fullName || ""}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))), [channels, query]);
  const groups = filtered.filter((channel) => !channel.isDm);
  const directs = filtered.filter((channel) => channel.isDm);
  const connected = connectionState === "connected";
  return <aside aria-label="Danh sách trò chuyện" className={cn("h-full w-full shrink-0 flex-col border-r border-border bg-card md:flex md:w-72", showSidebar ? "flex" : "hidden")}>
    <div className="border-b border-border px-5 pb-5 pt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><MessageSquare className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1"><h1 className="text-base font-semibold tracking-tight text-foreground">Không gian trao đổi</h1><p className="mt-0.5 text-xs text-muted-foreground">Big Data Club</p></div>
        <button onClick={() => setSearchOpen(true)} aria-label="Tạo tin nhắn riêng" className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"><Plus className="h-4 w-4" /></button>
      </div>
      <label className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input aria-label="Tìm cuộc trò chuyện" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kênh, người trò chuyện…" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
      </label>
    </div>
    <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {channelsLoading ? <div className="space-y-2" aria-label="Đang tải kênh">{[1, 2, 3, 4].map((id) => <div key={id} className="h-12 animate-pulse rounded-xl bg-muted" />)}</div> : <>
        {[{ label: "Kênh cộng đồng", channels: groups }, { label: "Tin nhắn riêng", channels: directs }].map((section) => <section key={section.label}>
          <div className="mb-2 flex items-center justify-between px-3"><h2 className="text-xs font-semibold tracking-wide text-muted-foreground">{section.label}</h2><span className="text-xs tabular-nums text-muted-foreground">{section.channels.length}</span></div>
          {section.channels.length ? <ul className="space-y-1">{section.channels.map((channel) => {
            const active = channel.id === activeChannelId;
            const unread = unreadCounts[channel.id] || 0;
            const name = channel.dmUser?.fullName || channel.name;
            const Icon = channel.isPrivate ? Lock : Hash;
            return <li key={channel.id}><button onClick={() => setActiveChannelId(channel.id)} aria-current={active ? "page" : undefined} className={cn("flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors active:scale-[0.98]", active ? "bg-blue-500/10 text-blue-700 dark:text-blue-300" : "text-foreground hover:bg-muted")}>
              {channel.isDm ? <ChatAvatar name={name} src={channel.dmUser?.profilePicture} size="sm" /> : <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", active ? "bg-blue-500/10" : "bg-muted text-muted-foreground")}><Icon className="h-4 w-4" /></div>}
              <div className="min-w-0 flex-1"><p className={cn("truncate text-sm", active || unread ? "font-semibold" : "font-medium")}>{name}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{channel.isDm ? channel.dmUser?.email : channel.description || (channel.isPrivate ? "Kênh riêng tư" : "Trao đổi cùng cộng đồng")}</p></div>
              {unread > 0 && <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">{unread > 99 ? "99+" : unread}</span>}
            </button></li>;
          })}</ul> : <p className="px-3 py-3 text-xs leading-relaxed text-muted-foreground">{query ? "Không tìm thấy cuộc trò chuyện." : section.label === "Tin nhắn riêng" ? "Nhấn + để kết nối với một thành viên." : "Chưa có kênh trong danh sách."}</p>}
        </section>)}
      </>}
    </nav>
    <div className="space-y-3 border-t border-border p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", connected ? "bg-emerald-500" : "bg-amber-500")} />{connected ? "Đang kết nối" : "Đang kết nối lại"}</span><button aria-label="Tải lại danh sách kênh" disabled={refreshing} onClick={async () => { setRefreshing(true); await refreshChannels(); setRefreshing(false); }} className="rounded-lg p-1.5 hover:bg-muted active:scale-95"><RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /></button></div>
      <div className="flex items-center gap-2"><button onClick={() => setSettingsOpen(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted active:scale-95"><SlidersHorizontal className="h-3.5 w-3.5" />Tùy chọn chat</button>{isAdmin && <Link href="/settings/chat-roles" aria-label="Quản trị kênh chat" className="rounded-xl border border-border p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Settings2 className="h-4 w-4" /></Link>}</div>
    </div>
    <ChatSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    <UserSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} onSelectChannel={setActiveChannelId} onAddChannelToList={addChannel} />
  </aside>;
}
