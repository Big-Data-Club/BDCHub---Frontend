"use client";

import * as React from "react";
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export interface LmsButtonProps extends Omit<ShadcnButtonProps, "size" | "variant"> {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  size?: "default" | "sm" | "lg" | "icon" | "md" | null;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "destructive" | "outline" | "link" | "default" | null;
}

function getShadcnSize(size?: LmsButtonProps["size"]): "default" | "sm" | "lg" | "icon" {
  if (!size || size === "md" || size === "default") return "default";
  return size;
}

function renderButtonContent(
  children: React.ReactNode,
  loading?: boolean,
  icon?: React.ReactNode,
  iconPosition: "left" | "right" = "left",
  asChild?: boolean
) {
  if (asChild) {
    return children;
  }
  return (
    <>
      {loading ? (
        <Spinner className="w-4 h-4 border-2 border-current shrink-0" />
      ) : (
        iconPosition === "left" && icon
      )}
      {children}
      {!loading && iconPosition === "right" && icon}
    </>
  );
}

export const PrimaryBtn = React.forwardRef<HTMLButtonElement, LmsButtonProps>(
  ({ children, loading, icon, iconPosition = "left", className, disabled, size = "default", asChild, variant: _variant, ...props }, ref) => (
    <ShadcnButton
      ref={ref}
      asChild={asChild}
      size={getShadcnSize(size)}
      className={cn(
        "font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm shadow-blue-500/20",
        "hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-200",
        "dark:bg-gradient-to-r dark:from-cyan-500 dark:to-cyan-600 dark:text-slate-950 dark:hover:from-cyan-400 dark:hover:to-cyan-500 dark:shadow-cyan-500/20",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {renderButtonContent(children, loading, icon, iconPosition, asChild)}
    </ShadcnButton>
  )
);
PrimaryBtn.displayName = "PrimaryBtn";

export const SecondaryBtn = React.forwardRef<HTMLButtonElement, LmsButtonProps>(
  ({ children, loading, icon, iconPosition = "left", className, disabled, size = "default", asChild, variant: _variant, ...props }, ref) => (
    <ShadcnButton
      ref={ref}
      asChild={asChild}
      variant="outline"
      size={getShadcnSize(size)}
      className={cn(
        "font-semibold rounded-xl transition-all duration-200 cursor-pointer",
        "bg-white border-slate-300 text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400",
        "dark:bg-lms-card dark:border-blue-500/20 dark:text-slate-300 dark:hover:bg-lms-hover dark:hover:border-blue-500/40 dark:hover:text-white",
        "active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {renderButtonContent(children, loading, icon, iconPosition, asChild)}
    </ShadcnButton>
  )
);
SecondaryBtn.displayName = "SecondaryBtn";

export const GhostBtn = React.forwardRef<HTMLButtonElement, LmsButtonProps>(
  ({ children, loading, icon, iconPosition = "left", className, disabled, size = "default", asChild, variant: _variant, ...props }, ref) => (
    <ShadcnButton
      ref={ref}
      asChild={asChild}
      variant="ghost"
      size={getShadcnSize(size)}
      className={cn(
        "font-semibold rounded-xl transition-all duration-200 cursor-pointer",
        "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
        "dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-lms-hover",
        "active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {renderButtonContent(children, loading, icon, iconPosition, asChild)}
    </ShadcnButton>
  )
);
GhostBtn.displayName = "GhostBtn";

export const DangerBtn = React.forwardRef<HTMLButtonElement, LmsButtonProps>(
  ({ children, loading, icon, iconPosition = "left", className, disabled, size = "default", asChild, variant: _variant, ...props }, ref) => (
    <ShadcnButton
      ref={ref}
      asChild={asChild}
      variant="destructive"
      size={getShadcnSize(size)}
      className={cn(
        "font-semibold rounded-xl transition-all duration-200 cursor-pointer",
        "bg-red-600 text-white shadow-sm hover:bg-red-700",
        "dark:bg-red-500/20 dark:border dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/30 dark:hover:text-red-300",
        "active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {renderButtonContent(children, loading, icon, iconPosition, asChild)}
    </ShadcnButton>
  )
);
DangerBtn.displayName = "DangerBtn";

export const DestructiveBtn = DangerBtn;

export const LmsButton = React.forwardRef<HTMLButtonElement, LmsButtonProps>(
  ({ variant = "primary", ...props }, ref) => {
    switch (variant) {
      case "secondary":
      case "outline":
        return <SecondaryBtn ref={ref} {...props} />;
      case "ghost":
      case "link":
        return <GhostBtn ref={ref} {...props} />;
      case "danger":
      case "destructive":
        return <DangerBtn ref={ref} {...props} />;
      case "primary":
      case "default":
      default:
        return <PrimaryBtn ref={ref} {...props} />;
    }
  }
);
LmsButton.displayName = "LmsButton";

export const Button = LmsButton;
export default LmsButton;