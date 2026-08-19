import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const markerVariants = cva(
  "inline-flex items-center justify-center rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950",
        secondary: "bg-slate-100 text-slate-900 dark:bg-[#0F1E35] dark:text-slate-100 dark:border dark:border-blue-500/20",
        outline: "border border-slate-300 dark:border-blue-500/30 text-slate-700 dark:text-cyan-400 bg-transparent",
        destructive: "bg-red-500 text-white dark:bg-red-900/50 dark:text-red-300",
        success: "bg-emerald-500 text-white dark:bg-emerald-950/60 dark:text-emerald-400",
      },
      size: {
        sm: "h-5 min-w-[20px] px-1.5 text-[10px]",
        md: "h-6 min-w-[24px] px-2 text-xs",
        lg: "h-8 min-w-[32px] px-2.5 text-sm font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface MarkerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof markerVariants> {
  value?: React.ReactNode
}

const Marker = React.forwardRef<HTMLSpanElement, MarkerProps>(
  ({ className, variant, size, value, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(markerVariants({ variant, size }), className)}
        {...props}
      >
        {value ?? children}
      </span>
    )
  }
)

Marker.displayName = "Marker"

export { Marker, markerVariants }
