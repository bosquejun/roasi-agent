import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@roaster/ui/lib/utils"

/* ── Base Badge ────────────────────────────────────────────── */

const badgeVariants = cva(
  "inline-flex items-center font-[family-name:var(--font-pixel)] text-[8px] tracking-[0.06em] leading-none px-2 py-1 whitespace-nowrap border-[2px] rounded-none",
  {
    variants: {
      variant: {
        default:   "bg-card text-black border-black",
        /* Category */
        landing:   "bg-blue-soft   text-electric-blue  border-electric-blue",
        portfolio: "bg-pink-soft   text-hot-pink        border-hot-pink",
        saas:      "bg-acid-soft   text-[#5A7A00]       border-acid-lime",
        startup:   "bg-fire-red-soft text-fire-red       border-fire-red",
        agency:    "bg-fire-org-soft text-fire-orange    border-fire-orange",
        ecommerce: "bg-fire-yel-soft text-[#A07800]      border-fire-yellow",
        /* Status */
        live:      "bg-fire-red      text-white           border-fire-red",
        pending:   "bg-smoke         text-slate           border-ash",
        reviewed:  "bg-acid-soft     text-[#5A7A00]       border-acid-lime",
        trending:  "bg-electric-blue text-white           border-electric-blue",
        launched:  "bg-acid-lime     text-black           border-acid-lime",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}

/* ── Score Badge ───────────────────────────────────────────── */

export type ScoreTier = "nuclear" | "roasted" | "singed" | "decent" | "crispy"

const SCORE_TIERS: Record<
  ScoreTier,
  { label: string; bg: string; color: string; border: string }
> = {
  nuclear: { label: "💀 NUCLEAR", bg: "#FFE8E7", color: "#E8231B", border: "#E8231B" },
  roasted: { label: "🔥 ROASTED", bg: "#FFF0E0", color: "#F47820", border: "#F47820" },
  singed:  { label: "😬 SINGED",  bg: "#FFFBE0", color: "#A07800", border: "#F5C518" },
  decent:  { label: "👍 DECENT",  bg: "#F0FFC0", color: "#5A7A00", border: "#C8F135" },
  crispy:  { label: "⭐ CRISPY",  bg: "#DCFCE7", color: "#166534", border: "#22C55E" },
}

export function getScoreTier(score: number): ScoreTier {
  if (score <= 20) return "nuclear"
  if (score <= 40) return "roasted"
  if (score <= 60) return "singed"
  if (score <= 80) return "decent"
  return "crispy"
}

interface ScoreBadgeProps {
  score: number
  className?: string
}

function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const tier = getScoreTier(score)
  const { label, bg, color, border } = SCORE_TIERS[tier]

  return (
    <div
      className={cn("inline-flex items-center", className)}
      style={{
        gap: 10,
        background: bg,
        border: `3px solid ${border}`,
        padding: "8px 14px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <span
        className="font-[family-name:var(--font-pixel)] leading-none"
        style={{ fontSize: 20, color }}
      >
        {score}
      </span>
      <div className="flex flex-col">
        <span
          className="font-[family-name:var(--font-pixel)] leading-none"
          style={{ fontSize: 7, color }}
        >
          {label}
        </span>
        <span
          className="font-[family-name:var(--font-mono)] text-[10px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          / 100
        </span>
      </div>
    </div>
  )
}

export { Badge, ScoreBadge, badgeVariants }
