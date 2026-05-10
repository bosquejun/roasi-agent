import { cn } from "@roaster/ui/lib/utils"
import type * as React from "react"

/* ── Base Card ─────────────────────────────────────────────── */

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-none border-[3px] border-black",
        "transition-all duration-base",
        "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-xl",
        "bg-bg-card shadow-neo-md",
        className
      )}
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
      className={cn(
        "flex flex-col rounded-none border-[3px] border-black",
        "p-sp-5 bg-bg-card shadow-neo-md",
        className
      )}
    >
      <div className="font-pixel text-score-micro uppercase tracking-md text-text-muted mb-sp-3">
        {label}
      </div>
      <div
        className="font-pixel leading-none"
        style={{ fontSize: "var(--text-4xl)", color: accent ?? "var(--text-primary)", marginBottom: "var(--sp-2)" }}
      >
        {value}
      </div>
      {delta !== undefined && (
        <div
          className="text-text-xs"
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

function UserCard({
  handle,
  roasts,
  avgScore,
  badge,
  className,
}: UserCardProps) {
  return (
    <div
      className={cn(
        "flex items-start rounded-none border-[3px] border-black",
        "p-sp-5 bg-bg-card shadow-neo-md gap-sp-4",
        className
      )}
    >
      {/* Avatar */}
      <div
        className="flex flex-shrink-0 items-center justify-center border-[3px] border-black"
        style={{ width: "var(--size-avatar)", height: "var(--size-avatar)", background: "var(--fire-red)" }}
      >
        <span className="font-pixel text-white" style={{ fontSize: "var(--text-lg)" }}>
          {handle?.[0]?.toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col">
        <div className="font-pixel text-score-tiny text-text-primary mb-sp-1">
          @{handle}
        </div>
        {badge && (
          <span className="inline-block font-pixel text-white text-score-micro py-sp-1 px-sp-1 bg-fire-red border-[3px] border-black mb-sp-2">
            {badge}
          </span>
        )}
        {(roasts !== undefined || avgScore !== undefined) && (
          <div className="text-text-xs text-text-muted mt-sp-2">
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