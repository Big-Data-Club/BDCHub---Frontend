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
  const scoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const clearError = useCallback(() => setError(""), []);

  const refreshScore = useCallback(() => {
    void farmAPI
      .score()
      .then((result) => setScore(result.total_score))
      .catch(() => setScore(null));
  }, []);
  const refreshSummary = useCallback(() => {
    void farmAPI
      .load()
      .then(setSummary)
      .catch(() => {});
    refreshScore();
  }, [refreshScore]);
  const refreshAfterReward = useCallback(() => {
    refreshSummary();
    if (rewardTimer.current) clearTimeout(rewardTimer.current);
    if (scoreTimer.current) clearTimeout(scoreTimer.current);
    rewardTimer.current = setTimeout(refreshSummary, 4000);
    scoreTimer.current = setTimeout(refreshScore, 12000);
  }, [refreshSummary, refreshScore]);

  useEffect(() => {
    refreshSummary();
    const onVisible = () => {
      if (!document.hidden) refreshSummary();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (rewardTimer.current) clearTimeout(rewardTimer.current);
      if (scoreTimer.current) clearTimeout(scoreTimer.current);
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
      clearError={clearError}
      catalogInfo={summary?.catalog ?? []}
      onReward={refreshAfterReward}
      onRefresh={refreshSummary}
      score={score}
      dailyEarned={summary?.state.daily_earned ?? 0}
      dailyLimit={summary?.daily_limit ?? 100}
      message={message}
      error={error}
    />
  );
}
