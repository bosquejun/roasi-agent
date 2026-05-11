"use client"

import { cn } from "@roaster/ui/lib/utils"
import * as React from "react"

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "prefix"> {
  label?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  helperText?: string
  error?: boolean
  errorText?: string
}

function Input({
  className,
  type,
  label,
  prefix,
  suffix,
  helperText,
  error,
  errorText,
  id,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false)
  // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
  const inputId = id ?? React.useId()

  const wrapperClasses = cn(
    "flex bg-card transition-all duration-fast",
    "border-[3px] border-foreground",
    "shadow-neo-md",
    error
      ? "shadow-[4px_4px_0_var(--fire-red)]"
      : focused
        ? "border-[3px_solid_var(--fire-orange)] shadow-[4px_4px_0_var(--fire-orange)] ring-2 ring-fire-orange/50"
        : "",
    !error &&
      !focused &&
      "hover:-translate-x-px hover:-translate-y-px hover:shadow-neo-lg hover:border-[3px_solid_var(--charcoal)]",
    !error &&
      !focused &&
      "active:-translate-x-[var(--translate-md)] active:-translate-y-[var(--translate-md)] active:border-[3px_solid_var(--text-foreground)] active:shadow-none"
  )

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-btn-sm text-primary uppercase tracking-sm"
        >
          {label}
        </label>
      )}
      <div className={wrapperClasses}>
        {prefix && (
          <div
            className="flex select-none items-center whitespace-nowrap border-r-[3px] bg-smoke p-sp-3 text-xs"
            style={{ color: "var(--text-muted)", borderColor: "var(--foreground)" }}
          >
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          data-slot="input"
          className={cn(
            "flex-1 border-none bg-transparent text-base outline-none",
            "placeholder:text-stone",
            "disabled:pointer-events-none disabled:opacity-50",
            className
          )}
          style={{ padding: "10px 14px", color: "var(--text-primary)" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {suffix && (
          <div
            className={cn(
              "flex items-stretch border-l-[3px] bg-card",
              "[&_[data-slot=button]]:rounded-none [&_[data-slot=button]]:border-0 [&_[data-slot=button]]:shadow-none",
              "[&_[data-slot=button]]:h-full [&_[data-slot=button]]:px-4",
              "[&_[data-slot=button]]:translate-x-0 [&_[data-slot=button]]:translate-y-0",
              "[&_[data-slot=button]:hover]:translate-x-0 [&_[data-slot=button]:hover]:translate-y-0",
              "[&_[data-slot=button]:hover]:shadow-none [&_[data-slot=button]:hover]:brightness-110",
              "[&_[data-slot=button]:active]:translate-x-0 [&_[data-slot=button]:active]:translate-y-0",
              "[&_[data-slot=button]:active]:shadow-none [&_[data-slot=button]:active]:brightness-75"
            )}
            style={{ borderColor: "var(--foreground)" }}
          >
            {suffix}
          </div>
        )}
      </div>
      {errorText && <p className="text-fire-red text-xs">⚠ {errorText}</p>}
      {helperText && !errorText && (
        <p className="text-muted text-xs">{helperText}</p>
      )}
    </div>
  )
}

export { Input }
