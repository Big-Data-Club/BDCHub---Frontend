"use client";
import { useEffect, useState } from "react";
import { adminListChannels, adminCreateChannel } from "@/services/chat/chatService";
import type { ChatChannel } from "@/types/chat/chat";
export function useChatChannelSettings(enabled: boolean) {
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ slug: "", name: "", description: "", isPrivate: false });

  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    adminListChannels()
      .then(setChannels)
      .catch(() => setNotice("Không thể tải danh sách kênh. Hãy thử tải lại."))
      .finally(() => setLoading(false));
  }, [enabled]);

  const handleCreate = async () => {
    if (!form.slug || !form.name) return;
    setCreating(true);
    try {
      const ch = await adminCreateChannel(form);
      setChannels((prev) => [...prev, ch]);
      setForm({ slug: "", name: "", description: "", isPrivate: false });
      setShowForm(false);
      setNotice("Đã tạo kênh mới.");
    } catch (failure) {
      setNotice(failure instanceof Error ? failure.message : "Không thể tạo kênh. Hãy thử lại.");
    } finally {
      setCreating(false);
    }
  };

  return { channels, setChannels, loading, creating, showForm, setShowForm, form, setForm, notice, query, setQuery, handleCreate };
}
