import * as React from "react"
import { FolderOpen, LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, icon: Icon = FolderOpen, title = "Không có dữ liệu", description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-blue-500/20 bg-slate-50/50 dark:bg-[#091322]/50 p-8 text-center animate-in fade-in-50 duration-300",
          className
        )}
        {...props}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-[#0F1E35] text-slate-400 dark:text-slate-400 border border-slate-200 dark:border-blue-500/20 mb-4 shadow-xs">
          <Icon className="h-6 w-6 stroke-[1.75]" />
        </div>
        {title && (
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
            {description}
          </p>
        )}
        {action && <div className="mt-2">{action}</div>}
        {children}
      </div>
    )
  }
)

Empty.displayName = "Empty"

export { Empty }
