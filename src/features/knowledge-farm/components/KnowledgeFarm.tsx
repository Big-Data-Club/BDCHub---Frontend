"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import PlayerView from "./PlayerView";
import { farmAPI } from "../api";
import type { FarmView } from "../types";

export default function KnowledgeFarm() {
  const [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [summary, setSummary] = useState<FarmView | null>(null),
    [score, setScore] = useState<number | null>(null);
  const rewardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((text: string) => {
    setMessage(text);
    setError("");
  }, []);
  const fail = useCallback(
    (error: unknown) =>
      setError(
        error instanceof Error ? error.message : "Không thể tải nông trại.",
      ),
    [],
  );

  const refreshSummary = useCallback(() => {
    void farmAPI
      .load()
      .then(setSummary)
      .catch(() => {});

    void farmAPI
      .score()
      .then((result) => setScore(result.total_score))
      .catch(() => setScore(null));
  }, []);
  const refreshAfterReward = useCallback(() => {
    refreshSummary();
    if (rewardTimer.current) clearTimeout(rewardTimer.current);
    rewardTimer.current = setTimeout(refreshSummary, 4000);
  }, [refreshSummary]);

  useEffect(() => {
    refreshSummary();
    const timer = setInterval(() => {
      if (!document.hidden) refreshSummary();
    }, 60000);
    const onVisible = () => {
      if (!document.hidden) refreshSummary();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      if (rewardTimer.current) clearTimeout(rewardTimer.current);
    };
  }, [refreshSummary]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <PlayerView
      flash={flash}
      fail={fail}
      catalogInfo={summary?.catalog ?? []}
      onReward={refreshAfterReward}
      score={score}
      dailyEarned={summary?.state.daily_earned ?? 0}
      dailyLimit={summary?.daily_limit ?? 100}
      message={message}
      error={error}
    />
  );
}
