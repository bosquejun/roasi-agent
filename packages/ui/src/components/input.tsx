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

  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    border: error
      ? "3px solid var(--fire-red)"
      : focused
        ? "3px solid var(--fire-orange)"
        : "var(--border-rule)",
    boxShadow: error
      ? "4px 4px 0 var(--fire-red)"
      : focused
        ? "4px 4px 0 var(--fire-orange)"
        : "var(--shadow-md)",
    background: "var(--bg-card)",
    transition: "all 120ms",
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-btn-sm uppercase tracking-sm text-text-primary">
          {label}
        </label>
      )}
      <div style={wrapperStyle}>
        {prefix && (
          <div
            className="flex select-none items-center whitespace-nowrap bg-smoke text-text-xs text-foreground p-sp-3 border-r-[3px] border-black"
            style={{ color: "var(--text-muted)" }}
          >
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          data-slot="input"
          className={cn(
            "flex-1 bg-transparent text-text-base border-none outline-none",
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
              "flex items-stretch bg-card border-l-[3px] border-black",
              "[&_[data-slot=button]]:rounded-none [&_[data-slot=button]]:border-0 [&_[data-slot=button]]:shadow-none",
              "[&_[data-slot=button]]:h-full [&_[data-slot=button]]:px-4",
              "[&_[data-slot=button]]:translate-x-0 [&_[data-slot=button]]:translate-y-0",
              "[&_[data-slot=button]:hover]:translate-x-0 [&_[data-slot=button]:hover]:translate-y-0",
              "[&_[data-slot=button]:hover]:shadow-none [&_[data-slot=button]:hover]:brightness-110",
              "[&_[data-slot=button]:active]:translate-x-0 [&_[data-slot=button]:active]:translate-y-0",
              "[&_[data-slot=button]:active]:shadow-none [&_[data-slot=button]:active]:brightness-75"
            )}
          >
            {suffix}
          </div>
        )}
      </div>
      {errorText && (
        <p className="text-text-xs text-fire-red">
          ⚠ {errorText}
        </p>
      )}
      {helperText && !errorText && (
        <p className="text-text-xs text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
}

export { Input }
