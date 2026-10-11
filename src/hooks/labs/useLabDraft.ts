"use client";

import { useCallback, useEffect, useState } from "react";

/** Keep separate drafts for each learner, exercise and language. */
export function useLabDraft(userId: string | number | undefined, labId: number, language: string, starterCode: string, enabled: boolean) {
  const key = enabled && userId !== undefined ? `bdc:lab-draft:${userId}:${labId}:${language}` : "";
  const [draft, setDraft] = useState({ key: "", value: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let value = starterCode;
    let restored = false;
    if (key) {
      try {
        const stored = localStorage.getItem(key);
        if (stored !== null) { value = stored; restored = true; }
      } catch { /* The editor still works when browser storage is unavailable. */ }
    }
    setDraft({ key, value });
    setSaved(restored);
  }, [key, starterCode]);

  const setCode = useCallback((value: string) => {
    setDraft({ key, value });
    let persisted = false;
    if (key && value.length <= 32768) {
      try { localStorage.setItem(key, value); persisted = true; } catch { /* Storage full or disabled. */ }
    }
    setSaved(persisted);
  }, [key]);

  return { code: draft.key === key ? draft.value : starterCode, setCode, draftSaved: saved };
}
