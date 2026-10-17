"use client";
import { useCallback, useEffect, useState } from 'react';
import PlayerView from './PlayerView';
import { farmAPI } from '../api';
import type { FarmView } from '../types';

export default function KnowledgeFarm() {
  const [message, setMessage] = useState(''), [error, setError] = useState('');
  const [summary, setSummary] = useState<FarmView | null>(null), [score, setScore] = useState<number | null>(null);

  const flash = useCallback((text: string) => { setMessage(text); setError(''); }, []);
  const fail = useCallback((error: unknown) => setError(error instanceof Error ? error.message : 'Không thể tải nông trại.'), []);
  
  const refreshSummary = useCallback(() => {
    void farmAPI.load().then(setSummary).catch(() => { });

    void farmAPI.score().then(
      result => setScore(result.total_score)).catch(() => setScore(null));
  }, []);

  useEffect(() => { 
    refreshSummary(); 
    const timer = setInterval(refreshSummary, 15000); 
    return () => clearInterval(timer); 
  }, [refreshSummary]);

  return <div className="min-w-0 space-y-3">
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
      Điểm tài khoản: <strong>{score ?? '—'}</strong> · Học hôm nay: <strong>{summary?.state.daily_earned ?? 0}/{summary?.daily_limit ?? 100}</strong> · +5 điểm/câu đúng.
    </div>
    {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-red-800 dark:bg-red-950 dark:text-red-100">{error} <button className="underline" onClick={() => window.location.reload()}>Tải lại</button></div>}
    {message && <div role="status" className="rounded-xl bg-emerald-50 p-3 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">{message}</div>}
    <PlayerView flash={flash} fail={fail} catalogInfo={summary?.catalog ?? []} onReward={refreshSummary} />
  </div>;
}
