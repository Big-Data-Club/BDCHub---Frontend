"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { farmAPI } from "../api";
import type { AnswerResult, FarmView, LearningMode } from "../types";

export function useFarm() {
  const [view, setView] = useState<FarmView | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [selected, setSelected] = useState(1);
  const [mode, setMode] = useState<LearningMode>("quiz");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const offset = useRef(0);
  const sequence = useRef(0);
  const actionRunning = useRef(false);
  const accept = useCallback((data: FarmView) => {
    offset.current = Date.parse(data.server_time) - Date.now();
    setNow(Date.now() + offset.current);
    setView(data);
  }, []);
  const reload = useCallback(async () => {
    if (actionRunning.current) return;
    const seq = ++sequence.current;
    // Auth availability must not delay loading the farm.
    void farmAPI
      .score()
      .then((data) => {
        if (seq === sequence.current) setScore(data.total_score);
      })
      .catch(() => {
        if (seq === sequence.current) setScore(null);
      });
    try {
      const data = await farmAPI.load();
      if (seq === sequence.current) {
        accept(data);
        setError("");
      }
    } catch (e) {
      if (seq === sequence.current)
        setError(e instanceof Error ? e.message : "Không thể tải nông trại.");
    }
  }, [accept]);
  useEffect(() => {
    const requestSequence = sequence;
    void reload();
    const onVisible = () => {
      if (!document.hidden) void reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    const tick = setInterval(() => setNow(Date.now() + offset.current), 1000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(tick);
      ++requestSequence.current;
    };
  }, [reload]);
  const run = async (action: () => Promise<void>) => {
    if (actionRunning.current) return;
    actionRunning.current = true;
    ++sequence.current;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thể cập nhật nông trại.",
      );
    } finally {
      actionRunning.current = false;
      setBusy(false);
    }
  };
  const plot = view?.state.plots.find((p) => p.id === selected);
  return {
    view,
    score,
    selected,
    setSelected,
    mode,
    setMode,
    busy,
    error,
    result,
    setResult,
    challengeOpen,
    setChallengeOpen,
    now,
    plot,
    reload,
    care: () =>
      run(async () => {
        accept(await farmAPI.care(selected));
      }),
    start: () =>
      run(async () => {
        accept(await farmAPI.start(selected, mode));
        setResult(null);
        setChallengeOpen(true);
      }),
    answer: (answer: string) =>
      run(async () => {
        if (!plot?.challenge) return;
        const response = await farmAPI.answer(
          selected,
          plot.challenge.id,
          answer,
        );
        setResult(response);
        setChallengeOpen(false);
        accept(await farmAPI.load());
      }),
  };
}
