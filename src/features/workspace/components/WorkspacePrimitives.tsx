"use client";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function WorkspaceButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "h-9 gap-2 rounded-xl px-3 text-sm font-medium transition-all duration-200 active:scale-95",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
export function WorkspaceDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
  className,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[88dvh] overflow-y-auto rounded-2xl bg-white text-slate-900 dark:bg-lms-card dark:text-slate-100",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function WorkspaceLoading({
  label = "Đang mở Workspace…",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400"
      role="status"
    >
      <Loader2 className="size-5 animate-spin" />
      {label}
    </div>
  );
}
export function WorkspaceErrorBanner({
  message,
  retry,
}: {
  message: string | null;
  retry?: () => void;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
    >
      <AlertCircle className="size-4 shrink-0" />
      <span className="min-w-0 flex-1">{message}</span>
      {retry && <WorkspaceButton onClick={retry}>Thử lại</WorkspaceButton>}
    </div>
  );
}
export const workspaceInputClass =
  "min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-lms-border dark:bg-lms-input dark:text-slate-100";
