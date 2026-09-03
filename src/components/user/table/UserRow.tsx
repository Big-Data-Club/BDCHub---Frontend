"use client";
import React from "react";
import { User } from "@/types";
import { UserAvatar } from "../UserAvatar";

const ROLE_DISPLAY: Record<string, string> = {
  ROLE_ADMIN: "Admin",
  ROLE_MANAGER: "Manager",
  ROLE_USER: "Member",
  ROLE_ALUMNI: "Alumni",
};

export default function UserRow({ user, onClick, onToggleStatus, isAdmin }: { user: User; onClick: (u: User) => void; onToggleStatus: (id: string | number) => void; isAdmin: boolean; }) {
  const roleLabel = ROLE_DISPLAY[user.role as string] || user.role;
  const dateLabel = user.dateAdded
    ? new Date(user.dateAdded).toLocaleDateString("vi-VN")
    : "Chưa xác định";
  const orgLabel = user.organizations && user.organizations.length > 0
    ? user.organizations.join(", ")
    : (user.organization || "-");

  return (
    <>
      {/* ── Mobile card (< sm) ── */}
      <div
        className="sm:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer p-4"
        onClick={() => onClick(user)}
      >
        <div className="flex items-start gap-3">
          <UserAvatar name={user.name} src={user.profilePicture} className="w-10 h-10 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-50 truncate">{user.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
              </div>
              {/* Toggle + Details */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleStatus(user.id); }}
                  disabled={!isAdmin}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                    user.status ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                  } ${!isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                  role="switch"
                  aria-checked={user.status}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${user.status ? "translate-x-5" : "translate-x-1"}`} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onClick(user); }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Details
                </button>
              </div>
            </div>
            {/* Meta row */}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span><span className="font-medium text-slate-700 dark:text-slate-300">{roleLabel}</span></span>
              {user.team && <span>· {user.team}</span>}
              {orgLabel !== "-" && <span>· {orgLabel}</span>}
              <span>· {dateLabel}</span>
              <span className={user.status ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-400"}>
                · {user.status ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop table row (sm+) ── */}
      <div
        className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-x-auto"
        onClick={() => onClick(user)}
      >
        <div className="grid grid-cols-12 gap-4 items-center px-6 py-4 min-w-[640px]">
          {/* Name & Email */}
          <div className="col-span-3 flex items-center gap-3">
            <UserAvatar name={user.name} src={user.profilePicture} className="w-8 h-8" />
            <div className="min-w-0">
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-50 truncate">{user.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
          {/* Role */}
          <div className="col-span-1 text-center text-sm text-slate-700 dark:text-slate-300">{roleLabel}</div>
          {/* Team */}
          <div className="col-span-1 text-center text-sm text-slate-700 dark:text-slate-300">{user.team}</div>
          {/* Org */}
          <div className="col-span-2 text-center text-sm text-slate-700 dark:text-slate-300 truncate" title={orgLabel}>{orgLabel}</div>
          {/* Score */}
          <div className="col-span-1 text-center text-sm font-medium text-slate-900 dark:text-slate-50">{user.score}</div>
          {/* Date Added */}
          <div className="col-span-2 text-center text-sm text-slate-600 dark:text-slate-400">{dateLabel}</div>
          {/* Status & Action */}
          <div className="col-span-2 flex items-center justify-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStatus(user.id); }}
              disabled={!isAdmin}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                user.status ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
              } ${!isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
              role="switch"
              aria-checked={user.status}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${user.status ? "translate-x-5" : "translate-x-1"}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClick(user); }}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
