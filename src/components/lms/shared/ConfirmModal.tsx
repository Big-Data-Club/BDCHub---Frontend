"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Info, Trash2, X } from "lucide-react";
import { PrimaryBtn, SecondaryBtn, GhostBtn } from "./Button";
import { cn } from "@/lib/utils";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const VARIANT_ICONS = {
    danger: <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-600 dark:text-cyan-400" />,
  };

  const VARIANT_ICON_BG = {
    danger: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-500/20",
    warning: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/20",
    info: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-cyan-500/20",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={cn(
          "relative w-full max-w-md bg-white dark:bg-[#0F1E35] border border-slate-200/80 dark:border-blue-500/15 rounded-3xl p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          aria-label="Đóng modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center border flex-shrink-0", VARIANT_ICON_BG[variant])}>
            {VARIANT_ICONS[variant]}
          </div>
          <div>
            <h3 id="confirm-modal-title" className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-blue-500/10">
          <SecondaryBtn onClick={onClose} disabled={loading} size="sm">
            {cancelText}
          </SecondaryBtn>
          <PrimaryBtn
            onClick={onConfirm}
            loading={loading}
            size="sm"
            className={cn(
              variant === "danger" && "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white shadow-xs"
            )}
          >
            {confirmText}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
