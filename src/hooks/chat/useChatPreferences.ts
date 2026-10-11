"use client";
import { useCallback, useEffect, useState } from "react";
import type { ChatPreferences } from "@/types/chat/preferences";
import { DEFAULT_CHAT_PREFERENCES } from "@/constants/chat/preferences";

export function useChatPreferences(userId?: string) {
  const [preferences, setPreferences] = useState(DEFAULT_CHAT_PREFERENCES);
  const key = userId ? `bdc.chat.preferences:${userId}` : null;
  useEffect(() => {
    setPreferences(DEFAULT_CHAT_PREFERENCES);
    if (!key) return;
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      setPreferences({
        sound: typeof stored.sound === "boolean" ? stored.sound : true,
        compact: typeof stored.compact === "boolean" ? stored.compact : false,
        enterToSend: typeof stored.enterToSend === "boolean" ? stored.enterToSend : true,
      });
    } catch { /* Storage is optional (private browsing, invalid preferences). */ }
  }, [key]);
  const updatePreferences = useCallback((patch: Partial<ChatPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      if (key) { try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* optional storage */ } }
      return next;
    });
  }, [key]);
  return { preferences, updatePreferences };
}
