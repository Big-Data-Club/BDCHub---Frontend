import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, label, htmlFor, error, hint, required, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-1.5 w-full", className)} {...props}>
        {label && (
          <div className="flex items-center justify-between">
            <Label htmlFor={htmlFor} className="text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm">
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </Label>
          </div>
        )}
        {children}
        {hint && !error && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{hint}</p>
        )}
        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight">{error}</p>
        )}
      </div>
    )
  }
)

Field.displayName = "Field"

export { Field }
