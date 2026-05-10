"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SectionHeaderProps {
  icon: string;
  title: string;
  description: string;
  showAddButton?: boolean;
  onAdd?: () => void;
  addButtonText?: string;
}

export function SectionHeader({
  icon,
  title,
  description,
  showAddButton = false,
  onAdd,
  addButtonText = "Thêm",
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xl" aria-hidden="true">{icon}</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 ml-8">{description}</p>
      </div>

      {showAddButton && onAdd && (
        <Button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold
                     px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200
                     active:scale-95 flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {addButtonText}
        </Button>
      )}
    </div>
  );
}