"use client";
import { useEffect, useRef, useState } from "react";
import { searchUsers, getOrCreateDM } from "@/services/chat/chatService";
import type { ChatChannel, ChatUser } from "@/types/chat/chat";

export function useChatUserSearch(open: boolean, onSelect: (channel: ChatChannel) => void) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingUserId, setSubmittingUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const epoch = useRef(0);
  useEffect(() => {
    epoch.current++;
    setQuery(""); setUsers([]); setLoading(false); setError(null); setSubmittingUserId(null);
    return () => { epoch.current++; };
  }, [open]);
  useEffect(() => {
    let cancelled = false;
    if (!open || !query.trim()) { setUsers([]); setLoading(false); return; }
    setLoading(true); setError(null);
    const timer = setTimeout(async () => {
      try { const results = await searchUsers(query.trim()); if (!cancelled) setUsers(results); }
      catch { if (!cancelled) { setUsers([]); setError("Không thể tìm thành viên. Hãy thử lại."); } }
      finally { if (!cancelled) setLoading(false); }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [open, query]);
  const selectUser = async (user: ChatUser) => {
    if (submittingUserId !== null) return;
    const current = epoch.current;
    setSubmittingUserId(user.id); setError(null);
    try { const channel = await getOrCreateDM(user.id); if (current === epoch.current) onSelect(channel); }
    catch { if (current === epoch.current) setError("Không thể mở cuộc trò chuyện. Hãy thử lại."); }
    finally { if (current === epoch.current) setSubmittingUserId(null); }
  };
  return { query, setQuery, users, loading, submittingUserId, error, selectUser };
}
