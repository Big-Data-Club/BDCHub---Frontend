"use client";

import { useState } from "react";
import { Hash, Lock, Plus, MessageSquare, Settings } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import UserSearchModal from "./UserSearchModal";

export default function ChatSidebar() {
  const {
    channels,
    channelsLoading,
    activeChannelId,
    setActiveChannelId,
    unreadCounts,
    addChannel,
  } = useChat();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const groupChannels = channels.filter((c) => !c.isDm);
  const dmChannels = channels.filter((c) => c.isDm);

  return (
    <aside
      className={cn(
        "w-64 flex-shrink-0 flex flex-col h-full",
        "bg-slate-900 dark:bg-slate-950",
        "border-r border-slate-700/50 dark:border-slate-800"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50 dark:border-slate-800">
        <h1 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-900/50">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="tracking-tight">BDC Chat</span>
        </h1>
        {isAdmin && (
          <button
            onClick={() => router.push("/settings/chat-roles")}
            title="Cai dat kenh"
            className={cn(
              "p-1.5 rounded-lg text-slate-400",
              "hover:text-slate-200 hover:bg-slate-700/60",
              "transition-all duration-150 active:scale-95"
            )}
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {channelsLoading ? (
          <div className="space-y-1.5 px-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 rounded-lg bg-slate-700/40 animate-pulse"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Group Channels Section */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Kenh chung
                </p>
              </div>

              {groupChannels.length === 0 ? (
                <p className="text-xs text-slate-500 px-3 py-1">Khong co kenh nao.</p>
              ) : (
                <ul className="space-y-0.5">
                  {groupChannels.map((ch) => {
                    const isActive = ch.id === activeChannelId;
                    const unread = unreadCounts[ch.id] ?? 0;

                    return (
                      <li key={ch.id}>
                        <button
                          onClick={() => setActiveChannelId(ch.id)}
                          className={cn(
                            "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-100 text-left",
                            isActive
                              ? "bg-blue-600/90 text-white font-semibold shadow-sm shadow-blue-900/40 ring-1 ring-blue-500/30"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
                          )}
                        >
                          {ch.isPrivate ? (
                            <Lock
                              className={cn(
                                "h-3.5 w-3.5 flex-shrink-0",
                                isActive ? "text-blue-200" : "text-slate-500"
                              )}
                            />
                          ) : (
                            <Hash
                              className={cn(
                                "h-3.5 w-3.5 flex-shrink-0",
                                isActive ? "text-blue-200" : "text-slate-500"
                              )}
                            />
                          )}
                          <span className="flex-1 truncate">{ch.name}</span>

                          {unread > 0 && !isActive && (
                            <span
                              className={cn(
                                "flex-shrink-0 min-w-[18px] h-[18px] px-1",
                                "bg-blue-500 text-white text-[10px] font-bold",
                                "rounded-full flex items-center justify-center",
                                "shadow-sm shadow-blue-900/40"
                              )}
                            >
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Direct Messages Section */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Tin nhan rieng
                </p>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  title="Tin nhan moi"
                  className={cn(
                    "p-0.5 rounded-md text-slate-500",
                    "hover:text-slate-200 hover:bg-slate-700/60",
                    "transition-all duration-150 active:scale-95"
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {dmChannels.length === 0 ? (
                <div className="mx-1 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40 text-center">
                  <p className="text-xs text-slate-500">
                    Nhan <Plus className="inline h-3 w-3 mx-0.5" /> de chat 1:1
                  </p>
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {dmChannels.map((ch) => {
                    const isActive = ch.id === activeChannelId;
                    const unread = unreadCounts[ch.id] ?? 0;
                    const displayName = ch.dmUser?.fullName || ch.name;
                    const avatarUrl =
                      ch.dmUser?.profilePicture ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

                    return (
                      <li key={ch.id}>
                        <button
                          onClick={() => setActiveChannelId(ch.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-100 text-left",
                            isActive
                              ? "bg-blue-600/90 text-white font-semibold shadow-sm shadow-blue-900/40 ring-1 ring-blue-500/30"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
                          )}
                        >
                          <div className="relative h-6 w-6 rounded-full overflow-hidden flex-shrink-0 bg-slate-700 border border-slate-600/50 ring-1 ring-slate-600/30">
                            <Image
                              src={avatarUrl}
                              alt={displayName}
                              fill
                              sizes="24px"
                              className="object-cover"
                            />
                            <span className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-400 rounded-full ring-1 ring-slate-900" />
                          </div>

                          <span className="flex-1 truncate">{displayName}</span>

                          {unread > 0 && !isActive && (
                            <span
                              className={cn(
                                "flex-shrink-0 min-w-[18px] h-[18px] px-1",
                                "bg-blue-500 text-white text-[10px] font-bold",
                                "rounded-full flex items-center justify-center",
                                "shadow-sm shadow-blue-900/40"
                              )}
                            >
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </nav>

      {/* User search modal for starting DMs */}
      <UserSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectChannel={setActiveChannelId}
        onAddChannelToList={addChannel}
      />
    </aside>
  );
}
