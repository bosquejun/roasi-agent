"use client"

import * as React from "react"

import { cn } from "@roaster/ui/lib/utils"

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "prefix"> {
  label?: string
  prefix?: React.ReactNode
  helperText?: string
  error?: boolean
  errorText?: string
}

function Input({
  className,
  type,
  label,
  prefix,
  helperText,
  error,
  errorText,
  id,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false)
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
        <label
          htmlFor={inputId}
          className="font-[family-name:var(--font-pixel)] text-[8px] tracking-[0.08em] uppercase"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </label>
      )}
      <div style={wrapperStyle}>
        {prefix && (
          <div
            className="flex items-center font-[family-name:var(--font-mono)] text-[12px] whitespace-nowrap select-none"
            style={{
              padding: "10px 12px",
              background: "var(--smoke)",
              borderRight: "var(--border-rule)",
              color: "var(--text-muted)",
            }}
          >
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          data-slot="input"
          className={cn(
            "flex-1 bg-transparent font-[family-name:var(--font-mono)] text-[13px]",
            "outline-none border-none",
            "placeholder:text-stone",
            "disabled:pointer-events-none disabled:opacity-50",
            className
          )}
          style={{ padding: "10px 14px", color: "var(--text-primary)" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {errorText && (
        <p
          className="font-[family-name:var(--font-mono)] text-[11px]"
          style={{ color: "var(--fire-red)" }}
        >
          ⚠ {errorText}
        </p>
      )}
      {helperText && !errorText && (
        <p
          className="font-[family-name:var(--font-mono)] text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          {helperText}
        </p>
      )}
    </div>
  )
}

export { Input }
