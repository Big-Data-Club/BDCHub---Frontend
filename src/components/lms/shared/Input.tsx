"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { Field } from "@/components/ui/field";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      hint,
      required,
      icon,
      rightIcon,
      id: customId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || (label ? generatedId : undefined);

    return (
      <Field
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
      >
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "w-full rounded-xl px-4 py-3 bg-slate-50 dark:bg-lms-input border border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all duration-200 text-sm",
              icon && "pl-11",
              rightIcon && "pr-11",
              error &&
                "border-red-500 dark:border-red-500/50 focus:ring-red-500/20 dark:focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
      </Field>
    );
  }
);

Input.displayName = "Input";

