import { useEffect, useRef, useState } from "react";

export function useQuizReviewState(attemptId?: number) {
  const [flagged, setFlagged] = useState<number[]>([]);
  const toggleRef = useRef<(id: number) => void>(() => {});
  const [departures, setDepartures] = useState(0);
  const focus = useRef({ departures: 0, away_ms: 0 });
  const awayAt = useRef<number | null>(null);
  useEffect(() => {
    if (!attemptId) return;
    const key = `bdc:quiz-attempt:${attemptId}:review`;
    let flags: number[] = [];
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      flags = Array.isArray(saved?.flagged) ? saved.flagged.filter(Number.isSafeInteger) : [];
      focus.current = { departures: Math.max(0, Number(saved?.departures) || 0), away_ms: Math.max(0, Number(saved?.away_ms) || 0) };
      awayAt.current = saved?.awayAt ?? null;
    } catch { /* Storage may be unavailable; tracking still works in memory. */ }
    setFlagged(flags);
    setDepartures(focus.current.departures);
    const persist = () => {
      try { sessionStorage.setItem(key, JSON.stringify({ flagged: flags, ...focus.current, awayAt: awayAt.current })); } catch { /* In-memory fallback. */ }
    };
    const visibility = () => {
      if (document.hidden && awayAt.current === null) {
        awayAt.current = Date.now();
        focus.current.departures++;
      } else if (!document.hidden && awayAt.current !== null) {
        focus.current.away_ms += Math.max(0, Date.now() - awayAt.current);
        awayAt.current = null;
      }
      setDepartures(focus.current.departures);
      persist();
    };
    toggleRef.current = (id: number) => {
      flags = flags.includes(id) ? flags.filter(n => n !== id) : [...flags, id];
      setFlagged(flags);
      persist();
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);

    return () => {
      document.removeEventListener("visibilitychange", visibility);
      toggleRef.current = () => {};
    };
  }, [attemptId]);
  return {
    flagged, departures,
    toggleFlag: (id: number) => toggleRef.current(id),
    getFocusSummary: () => ({ departures: Math.min(100000, focus.current.departures), away_seconds: Math.min(31536000, Math.floor((focus.current.away_ms + (awayAt.current === null ? 0 : Math.max(0, Date.now() - awayAt.current))) / 1000)) }),
  };
}
