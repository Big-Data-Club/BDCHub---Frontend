"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base layout
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border px-3 py-2 text-sm shadow-xs",
      // Light mode - solid input background so it's never transparent
      "bg-slate-50 border-slate-300 text-slate-900",
      // Dark mode
      "dark:bg-[#0D192E] dark:border-blue-500/20 dark:text-slate-100",
      // Placeholder
      "data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500",
      // Focus
      "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
      "dark:focus:ring-cyan-400/20 dark:focus:border-cyan-400/50",
      // States & Animations
      "disabled:cursor-not-allowed disabled:opacity-50",
      "[&>span]:line-clamp-1 transition-all duration-200 group",
      // Chevron rotation when open
      "[&>svg]:transition-transform [&>svg]:duration-200 data-[state=open]:[&>svg]:rotate-180",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1 text-slate-500 dark:text-slate-400",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1 text-slate-500 dark:text-slate-400",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", sideOffset = 4, onPointerDownOutside, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      onPointerDownOutside={(e) => {
        if (onPointerDownOutside) {
          onPointerDownOutside(e);
        }
      }}
      className={cn(
        "relative z-[10050] min-w-[8rem] rounded-xl border p-1",
        // Cap height to available viewport space (Radix provides this var); fallback to 384px.
        "max-h-[min(384px,var(--radix-select-content-available-height,384px))] overflow-hidden overflow-x-hidden",
        // Light mode
        "bg-white border-slate-200/90 text-slate-900 shadow-xl shadow-slate-900/10",
        // Dark mode - explicit BDC Design Rhythm tokens
        "dark:bg-[#0F1E35] dark:border-blue-500/25 dark:text-slate-100 dark:shadow-2xl dark:shadow-black/40",
        // Micro Animations: 150ms springy ease-out scale & fade
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-97 data-[state=open]:zoom-in-97",
        "data-[side=bottom]:slide-in-from-top-1.5 data-[side=top]:slide-in-from-bottom-1.5",
        "data-[side=left]:slide-in-from-right-1.5 data-[side=right]:slide-in-from-left-1.5",
        "duration-150 ease-out",
        "origin-[--radix-select-content-transform-origin]",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "min-h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-3 pr-8 text-sm outline-none transition-colors duration-150",
      "text-slate-800 dark:text-slate-200",
      "focus:bg-blue-50/90 focus:text-blue-700 dark:focus:bg-blue-500/20 dark:focus:text-cyan-300",
      "hover:bg-slate-100/80 dark:hover:bg-slate-800/60",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2.5 flex h-4 w-4 items-center justify-center text-blue-600 dark:text-cyan-400">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
