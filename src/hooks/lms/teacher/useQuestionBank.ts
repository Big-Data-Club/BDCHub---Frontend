"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import quizService from "@/services/lms/quizService";
import type {
  BankFilters,
  BankItem,
  BankStats,
} from "@/types/lms/questionBank";
import {
  bankQueryReducer,
  initialBankQuery,
} from "@/utils/lms/questionBankQuery";

export function useQuestionBank(courseId: number) {
  const [query, dispatch] = useReducer(bankQueryReducer, initialBankQuery);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<BankItem[]>([]);
  const [stats, setStats] = useState<BankStats | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const statsRequest = useRef<AbortController | null>(null);
  const pageSize = 20;

  useEffect(() => {
    const timer = setTimeout(
      () => dispatch({ type: "filter", filters: { q } }),
      300,
    );
    return () => clearTimeout(timer);
  }, [q]);

  const loadItems = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError("");
    try {
      const response = await quizService.getQuestionBank(
        courseId,
        {
          page: query.page,
          page_size: pageSize,
          q: query.q || undefined,
          difficulty: query.difficulty || undefined,
          bloom_level: query.bloom || undefined,
          source: query.source || undefined,
          time_from: query.month ? `${query.month}-01` : undefined,
          sort: query.sort,
          order: query.order,
        },
        controller.signal,
      );
      if (controller.signal.aborted || request.current !== controller) return;
      setItems(response.data.items);
      setTotal(response.data.total);
      setTotalPages(response.data.total_pages);
    } catch {
      if (!controller.signal.aborted && request.current === controller)
        setError("Không tải được ngân hàng đề thi.");
    } finally {
      if (!controller.signal.aborted && request.current === controller)
        setLoading(false);
    }
  }, [courseId, query]);

  const loadStats = useCallback(async () => {
    statsRequest.current?.abort();
    const controller = new AbortController();
    statsRequest.current = controller;
    try {
      const response = await quizService.getBankStats(
        courseId,
        controller.signal,
      );
      if (!controller.signal.aborted) setStats(response.data);
    } catch {
      /* Stats are supplementary; list failures have their own error UI. */
    }
  }, [courseId]);

  useEffect(() => {
    void loadItems();
    return () => request.current?.abort();
  }, [loadItems]);
  useEffect(() => {
    void loadStats();
    return () => statsRequest.current?.abort();
  }, [loadStats]);

  const setFilter = useCallback(
    (filters: Partial<BankFilters>) => dispatch({ type: "filter", filters }),
    [],
  );
  return {
    ...query,
    q,
    setQ,
    items,
    stats,
    total,
    totalPages,
    loading,
    error,
    pageSize,
    loadItems,
    loadStats,
    selectionKey: JSON.stringify([
      query.q,
      query.difficulty,
      query.bloom,
      query.source,
      query.month,
      query.sort,
      query.order,
    ]),
    setDifficulty: (difficulty: string) => setFilter({ difficulty }),
    setBloom: (bloom: string) => setFilter({ bloom }),
    setSource: (source: string) => setFilter({ source }),
    setMonth: (month: string) => setFilter({ month }),
    setSort: (sort: string) => setFilter({ sort }),
    setOrder: (order: "asc" | "desc") => setFilter({ order }),
    setPage: (page: number | ((previous: number) => number)) =>
      dispatch({
        type: "page",
        page,
      }),
  };
}
