import * as React from "react"

import { cn } from "@/lib/utils"

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full items-center rounded-xl border border-slate-300 dark:border-blue-500/20 bg-slate-50 dark:bg-[#0D192E] transition-all focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-cyan-400/20 focus-within:border-blue-500 dark:focus-within:border-cyan-400/50 overflow-hidden",
      className
    )}
    {...props}
  />
))
InputGroup.displayName = "InputGroup"

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center px-3 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium shrink-0 bg-slate-100/50 dark:bg-[#070E1C]/50 select-none",
      className
    )}
    {...props}
  />
))
InputGroupAddon.displayName = "InputGroupAddon"

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
))
InputGroupInput.displayName = "InputGroupInput"

export { InputGroup, InputGroupAddon, InputGroupInput }
