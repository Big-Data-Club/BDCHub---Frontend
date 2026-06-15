"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X, Loader2, MessageSquare } from "lucide-react";
import { searchUsers, getOrCreateDM } from "@/services/chatService";
import { ChatUser } from "@/types/chat";
import Image from "next/image";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChannel: (channelId: number) => void;
  onAddChannelToList: (channel: any) => void;
}

export default function UserSearchModal({
  isOpen,
  onClose,
  onSelectChannel,
  onAddChannelToList,
}: UserSearchModalProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingUserId, setSubmittingUserId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setUsers([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchUsers(query);
        setUsers(results);
      } catch (err) {
        console.error("Search users error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectUser = async (targetUser: ChatUser) => {
    setSubmittingUserId(targetUser.id);
    try {
      const channel = await getOrCreateDM(targetUser.id);
      onAddChannelToList(channel);
      onSelectChannel(channel.id);
      onClose();
    } catch (err) {
      console.error("Get or create DM error:", err);
    } finally {
      setSubmittingUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 
                      border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl 
                      flex flex-col max-h-[85vh] overflow-hidden transition-all duration-300 transform scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Tin nhắn trực tiếp mới
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-slate-800 dark:text-slate-100 
                       placeholder-slate-400 text-sm py-1"
          />
          {loading && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {!query.trim() ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-600 text-sm">
              Nhập tên hoặc email để bắt đầu tìm kiếm
            </div>
          ) : !loading && users.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-600 text-sm">
              Không tìm thấy thành viên nào khớp với &quot;{query}&quot;
            </div>
          ) : (
            <ul className="space-y-1">
              {users.map((u) => {
                const isSubmitting = submittingUserId === u.id;
                const avatarUrl = u.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.fullName)}`;

                return (
                  <li key={u.id}>
                    <button
                      onClick={() => handleSelectUser(u)}
                      disabled={isSubmitting}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left
                                 hover:bg-blue-50 dark:hover:bg-blue-950/35 group transition-colors"
                    >
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                        <Image
                          src={avatarUrl}
                          alt={u.fullName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {u.fullName}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                          {u.email}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-slate-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors pr-1">
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        ) : (
                          <MessageSquare className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
