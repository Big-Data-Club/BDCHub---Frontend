"use client";

import React from "react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Đang tải..." }: LoadingStateProps) {
  return (
    <div className="col-span-4 flex flex-col items-center justify-center py-16 text-center">
      <div className="h-10 w-10 rounded-full border-2 border-slate-200 dark:border-slate-700
                      border-t-blue-600 dark:border-t-blue-500 animate-spin" />
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">{message}</p>
    </div>
  );
}