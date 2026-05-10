"use client";
import React from "react";
import { User } from "@/types";
import Avatar from "./Avatar";

export default function UserRow({ user, onClick, onToggleStatus, isAdmin }: { user: User; onClick: (u: User) => void; onToggleStatus: (id: string | number) => void; isAdmin: boolean; }) {
  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-x-auto min-w-max sm:min-w-full"
      onClick={() => onClick(user)}
    >
      <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center px-3 sm:px-6 py-3 sm:py-4">
        {/* Name & Email */}
        <div className="col-span-5 flex items-center gap-3">
          <Avatar code={user.code} size={32} />
          <div className="min-w-0">
            <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50 truncate">
              {user.name}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </div>
          </div>
        </div>

        {/* Role */}
        <div className="col-span-1 text-center text-sm text-slate-700 dark:text-slate-300">
          {user.role}
        </div>

        {/* Team */}
        <div className="col-span-1 text-center text-sm text-slate-700 dark:text-slate-300">
          {user.team}
        </div>

        {/* Score */}
        <div className="col-span-1 text-center text-sm font-medium text-slate-900 dark:text-slate-50">
          {user.score}
        </div>

        {/* Date Added */}
        <div className="col-span-2 text-center text-sm text-slate-600 dark:text-slate-400">
          {user.dateAdded ? new Date(user.dateAdded).toLocaleDateString() : "Chưa xác định"}
        </div>

        {/* Status & Action */}
        <div className="col-span-2 flex items-center justify-center gap-3">
          {/* Status Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(user.id);
            }}
            disabled={!isAdmin}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              user.status
                ? "bg-blue-600"
                : "bg-slate-300 dark:bg-slate-600"
            } ${!isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
            role="switch"
            aria-checked={user.status}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                user.status ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>

          {/* Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(user);
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
