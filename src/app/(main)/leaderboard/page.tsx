"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Trophy, Medal, Award, TrendingUp, Loader2 } from "lucide-react";
import { userService } from "@/services/userService";
import type { UserResponse } from "@/services/userService";

const RANK_CONFIG: Record<
  number,
  { icon: typeof Trophy; colorClass: string; badgeBg: string; podiumFrom: string; podiumTo: string }
> = {
  1: {
    icon: Trophy,
    colorClass: "text-yellow-500",
    badgeBg: "bg-yellow-50 dark:bg-yellow-950/40",
    podiumFrom: "from-yellow-400",
    podiumTo: "to-yellow-600",
  },
  2: {
    icon: Medal,
    colorClass: "text-slate-400",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    podiumFrom: "from-slate-300",
    podiumTo: "to-slate-500",
  },
  3: {
    icon: Medal,
    colorClass: "text-slate-400",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    podiumFrom: "from-slate-300",
    podiumTo: "to-slate-500",
  },
  4: {
    icon: Award,
    colorClass: "text-orange-500",
    badgeBg: "bg-orange-50 dark:bg-orange-950/40",
    podiumFrom: "from-orange-400",
    podiumTo: "to-orange-600",
  },
  5: {
    icon: Award,
    colorClass: "text-orange-500",
    badgeBg: "bg-orange-50 dark:bg-orange-950/40",
    podiumFrom: "from-orange-400",
    podiumTo: "to-orange-600",
  },
};

const PODIUM_HEIGHT: Record<number, string> = {
  1: "h-44",
  2: "h-36",
  3: "h-32",
  4: "h-28",
  5: "h-24",
};

function getPodiumOrder(top5: UserResponse[]) {
  if (top5.length < 5) return top5;
  return [top5[1], top5[0], top5[2], top5[3], top5[4]];
}

function PodiumCard({ user, rank }: { user: UserResponse; rank: number }) {
  const cfg = RANK_CONFIG[rank] ?? RANK_CONFIG[5];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col items-center">
      {/* Avatar + info */}
      <div className="mb-3 text-center">
        <div
          className={`w-16 h-16 rounded-full ${cfg.badgeBg} ${cfg.colorClass} flex items-center justify-center mx-auto mb-2 ring-4 ring-white dark:ring-slate-900 shadow-sm`}
        >
          <Icon className="h-8 w-8" />
        </div>
        <div className={`text-2xl font-extrabold mb-0.5 ${cfg.colorClass}`}>#{rank}</div>
        <div className="font-semibold text-slate-800 dark:text-slate-100 max-w-[110px] truncate text-sm">
          {user.name}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{user.team}</div>
        <div className="text-xs text-slate-400 dark:text-slate-600">{user.code}</div>
      </div>

      {/* Podium bar */}
      <div
        className={`w-28 ${PODIUM_HEIGHT[rank]} bg-gradient-to-b ${cfg.podiumFrom} ${cfg.podiumTo} rounded-t-2xl flex flex-col items-center justify-center text-white relative overflow-hidden shadow-sm`}
      >
        <div className="absolute inset-0 bg-white/10" />
        <div className="relative z-10 text-center">
          <div className="text-2xl font-extrabold">{user.totalScore ?? 0}</div>
          <div className="text-xs opacity-80">pts</div>
        </div>
      </div>
    </div>
  );
}

const LeaderboardPage = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await userService.getAll();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sortedUsers = useMemo(
    () =>
      [...users]
        .filter((u) => u.active)
        .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)),
    [users]
  );

  const top5 = sortedUsers.slice(0, 5);
  const remaining = sortedUsers.slice(5);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8" id="leaderboard-page">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14" id="leaderboard-header">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
              Leaderboard
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Top performers and rankings
          </p>
        </div>

        {/* Top 5 Podium */}
        {top5.length > 0 && (
          <div className="mb-14" id="leaderboard-podium">
            <h2 className="text-xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100">
              Top 5 Champions
            </h2>
            <div className="flex items-end justify-center gap-3 sm:gap-6 px-4 overflow-x-auto pb-2">
              {getPodiumOrder(top5).map((user) => {
                const rank = top5.findIndex((u) => u.id === user.id) + 1;
                return <PodiumCard key={user.id} user={user} rank={rank} />;
              })}
            </div>
          </div>
        )}

        {/* Remaining */}
        {remaining.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-center mb-5 text-slate-800 dark:text-slate-100">
              Other Rankings
            </h2>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {remaining.map((user, idx) => {
                  const rank = idx + 6;
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-sm flex-shrink-0">
                          #{rank}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500 truncate">
                            {user.code} · {user.team} · {user.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                          {user.totalScore ?? 0}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-600">pts</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {sortedUsers.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No rankings available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;