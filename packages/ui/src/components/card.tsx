import * as React from "react"

import { cn } from "@roaster/ui/lib/utils"

/* ── Base Card ─────────────────────────────────────────────── */

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "border-[3px] border-black rounded-none",
        "transition-all duration-[150ms]",
        "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-xl",
        className
      )}
      style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-md)" }}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── Stat Card ─────────────────────────────────────────────── */

interface StatCardProps {
  value: string | number
  label: string
  delta?: number
  accent?: string
  className?: string
}

function StatCard({ value, label, delta, accent, className }: StatCardProps) {
  const isPositive = delta !== undefined ? delta >= 0 : true

  return (
    <div
      className={cn("border-[3px] border-black rounded-none flex flex-col", className)}
      style={{
        padding: "20px 24px",
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div
        className="font-[family-name:var(--font-pixel)] text-[7px] tracking-[0.1em] uppercase"
        style={{ color: "var(--text-muted)", marginBottom: 12 }}
      >
        {label}
      </div>
      <div
        className="font-[family-name:var(--font-pixel)] leading-none"
        style={{
          fontSize: 28,
          color: accent ?? "var(--text-primary)",
          marginBottom: 8,
        }}
      >
        {value}
      </div>
      {delta !== undefined && (
        <div
          className="font-[family-name:var(--font-mono)] text-[11px]"
          style={{ color: isPositive ? "#22C55E" : "var(--fire-red)" }}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(delta)}% vs last week
        </div>
      )}
    </div>
  )
}

/* ── User Card ─────────────────────────────────────────────── */

interface UserCardProps {
  handle?: string
  roasts?: number
  avgScore?: number
  badge?: string
  className?: string
}

function UserCard({ handle, roasts, avgScore, badge, className }: UserCardProps) {
  return (
    <div
      className={cn("border-[3px] border-black rounded-none flex items-start", className)}
      style={{
        padding: 20,
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-md)",
        gap: 16,
      }}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center border-[3px] border-black"
        style={{ width: 48, height: 48, background: "var(--fire-red)" }}
      >
        <span
          className="font-[family-name:var(--font-pixel)] text-white"
          style={{ fontSize: 14 }}
        >
          {handle?.[0]?.toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        <div
          className="font-[family-name:var(--font-pixel)]"
          style={{ fontSize: 9, color: "var(--text-primary)", marginBottom: 4 }}
        >
          @{handle}
        </div>
        {badge && (
          <span
            className="font-[family-name:var(--font-pixel)] inline-block text-white"
            style={{
              fontSize: 7,
              padding: "3px 6px",
              background: "var(--fire-red)",
              border: "var(--border-rule)",
              marginBottom: 8,
            }}
          >
            {badge}
          </span>
        )}
        {(roasts !== undefined || avgScore !== undefined) && (
          <div
            className="font-[family-name:var(--font-mono)] text-[11px]"
            style={{ color: "var(--text-muted)", marginTop: 8 }}
          >
            {roasts !== undefined && `${roasts} roasts`}
            {roasts !== undefined && avgScore !== undefined && " · "}
            {avgScore !== undefined && `avg score ${avgScore}`}
          </div>
        )}
      </div>
    </div>
  )
}

export { Card, StatCard, UserCard }
