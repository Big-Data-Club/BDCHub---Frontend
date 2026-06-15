"use client";

import { useState } from "react";
import { Hash, Lock, Plus, Users, MessageSquare } from "lucide-react";
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
    addChannel 
  } = useChat();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const groupChannels = channels.filter((c) => !c.isDm);
  const dmChannels = channels.filter((c) => c.isDm);

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full
                       bg-slate-50 dark:bg-slate-900
                       border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4
                      border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Trò chuyện
        </h1>
        {isAdmin && (
          <button
            onClick={() => router.push("/settings/chat-roles")}
            title="Quản lý kênh"
            className="p-1 rounded-md text-slate-400 hover:text-blue-600
                       hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-6">
        {channelsLoading ? (
          <div className="space-y-1 px-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Group Channels Section */}
            <div>
              <div className="flex items-center justify-between px-3 mb-1.5">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500
                              uppercase tracking-wider">
                  Kênh chung
                </p>
              </div>
              
              {groupChannels.length === 0 ? (
                <p className="text-xs text-slate-400 px-3 py-1">Không có kênh nào.</p>
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
                            "w-full flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm",
                            "transition-colors duration-100 text-left",
                            isActive
                              ? "bg-blue-600 text-white font-medium shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60"
                          )}
                        >
                          {ch.isPrivate
                            ? <Lock className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                            : <Hash className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                          }
                          <span className="flex-1 truncate">{ch.name}</span>

                          {/* Unread badge */}
                          {unread > 0 && !isActive && (
                            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1
                                             bg-blue-600 text-white text-[10px] font-bold
                                             rounded-full flex items-center justify-center">
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
              <div className="flex items-center justify-between px-3 mb-1.5">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500
                              uppercase tracking-wider">
                  Tin nhắn trực tiếp
                </p>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  title="Tin nhắn mới"
                  className="p-0.5 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {dmChannels.length === 0 ? (
                <p className="text-xs text-slate-400 px-3 py-2 bg-slate-100/50 dark:bg-slate-800/30 rounded-lg text-center">
                  Nhấn nút <Plus className="inline h-3 w-3 mx-0.5" /> để chat 1-to-1 với người khác.
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {dmChannels.map((ch) => {
                    const isActive = ch.id === activeChannelId;
                    const unread = unreadCounts[ch.id] ?? 0;
                    const displayName = ch.dmUser?.fullName || ch.name;
                    const avatarUrl = ch.dmUser?.profilePicture || 
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

                    return (
                      <li key={ch.id}>
                        <button
                          onClick={() => setActiveChannelId(ch.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm",
                            "transition-colors duration-100 text-left",
                            isActive
                              ? "bg-blue-600 text-white font-medium shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60"
                          )}
                        >
                          <div className="relative h-5 w-5 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700 border border-slate-300/30">
                            <Image
                              src={avatarUrl}
                              alt={displayName}
                              fill
                              sizes="20px"
                              className="object-cover"
                            />
                          </div>
                          
                          <span className="flex-1 truncate">{displayName}</span>

                          {/* Unread badge */}
                          {unread > 0 && !isActive && (
                            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1
                                             bg-blue-600 text-white text-[10px] font-bold
                                             rounded-full flex items-center justify-center">
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
