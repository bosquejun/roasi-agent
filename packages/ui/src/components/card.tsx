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
        "bg-bg-card p-sp-5 shadow-neo-md",
        className
      )}
    >
      <div className="mb-sp-3 font-pixel text-muted text-score-micro uppercase tracking-md">
        {label}
      </div>
      <div
        className="font-pixel leading-none"
        style={{
          fontSize: "var(--text-4xl)",
          color: accent ?? "var(--text-primary)",
          marginBottom: "var(--sp-2)",
        }}
      >
        {value}
      </div>
      {delta !== undefined && (
        <div
          className="text-xs"
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
        "gap-sp-4 bg-bg-card p-sp-5 shadow-neo-md",
        className
      )}
    >
      {/* Avatar */}
      <div
        className="flex flex-shrink-0 items-center justify-center border-[3px] border-black"
        style={{
          width: "var(--size-avatar)",
          height: "var(--size-avatar)",
          background: "var(--fire-red)",
        }}
      >
        <span
          className="font-pixel text-white"
          style={{ fontSize: "var(--text-lg)" }}
        >
          {handle?.[0]?.toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col">
        <div className="mb-sp-1 font-pixel text-primary text-score-tiny">
          @{handle}
        </div>
        {badge && (
          <span className="mb-sp-2 inline-block border-[3px] border-black bg-fire-red px-sp-1 py-sp-1 font-pixel text-score-micro text-white">
            {badge}
          </span>
        )}
        {(roasts !== undefined || avgScore !== undefined) && (
          <div className="mt-sp-2 text-muted text-xs">
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
