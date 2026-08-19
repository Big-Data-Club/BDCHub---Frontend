"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

const sizeClasses: Record<NonNullable<BaseModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
  full: "max-w-[95vw] h-[90vh]",
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  size = "lg",
  children,
  footer,
  className,
  bodyClassName,
}: BaseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "flex flex-col max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-[#0F1E35] border-slate-200 dark:border-blue-500/15 text-slate-900 dark:text-slate-100 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-blue-950/40 transition-all duration-200",
          sizeClasses[size],
          className
        )}
      >
        <DialogHeader className="p-6 pb-4 border-b border-slate-200/80 dark:border-blue-500/10 bg-slate-50/50 dark:bg-[#0A1628]/40">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className={cn("flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar", bodyClassName)}>
          {children}
        </div>

        {footer && (
          <DialogFooter className="p-5 border-t border-slate-200/80 dark:border-blue-500/10 bg-slate-50/80 dark:bg-[#0A1628]/60 backdrop-blur-sm">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BaseModal;
