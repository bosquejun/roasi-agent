import { cn } from "@roaster/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

/* ── Base Badge ────────────────────────────────────────────── */

const badgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-none border-[2px] px-sp-2 py-sp-1 font-pixel text-btn-sm leading-none tracking-xs",
  {
    variants: {
      variant: {
        default: "border-black bg-card text-black",
        /* Category */
        landing: "border-electric-blue bg-blue-soft text-electric-blue",
        portfolio: "border-hot-pink bg-pink-soft text-hot-pink",
        saas: "border-acid-lime bg-acid-soft text-[#5A7A00]",
        startup: "border-fire-red bg-fire-red-soft text-fire-red",
        agency: "border-fire-orange bg-fire-org-soft text-fire-orange",
        ecommerce: "border-fire-yellow bg-fire-yel-soft text-[#A07800]",
        /* Status */
        live: "border-fire-red bg-fire-red text-white",
        pending: "border-ash bg-smoke text-slate",
        reviewed: "border-acid-lime bg-acid-soft text-[#5A7A00]",
        trending: "border-electric-blue bg-electric-blue text-white",
        launched: "border-acid-lime bg-acid-lime text-black",
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
  { label: string; bgClass: string; color: string; borderColor: string }
> = {
  nuclear: {
    label: "💀 NUCLEAR",
    bgClass: "bg-fire-red-soft",
    color: "#E8231B",
    borderColor: "#E8231B",
  },
  roasted: {
    label: "🔥 ROASTED",
    bgClass: "bg-fire-org-soft",
    color: "#F47820",
    borderColor: "#F47820",
  },
  singed: {
    label: "😬 SINGED",
    bgClass: "bg-fire-yel-soft",
    color: "#A07800",
    borderColor: "#F5C518",
  },
  decent: {
    label: "👍 DECENT",
    bgClass: "bg-acid-soft",
    color: "#5A7A00",
    borderColor: "#5A7A00",
  },
  crispy: {
    label: "⭐ CRISPY",
    bgClass: "bg-score-crispy-soft",
    color: "#166534",
    borderColor: "#22C55E",
  },
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
  const { label, bgClass, color } = SCORE_TIERS[tier]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-sp-3 border-[3px] border-black bg-card shadow-neo-sm",
        bgClass,
        className
      )}
      style={{ padding: "var(--sp-2) var(--sp-4)", color }}
    >
      <span
        className="font-pixel leading-none"
        style={{ fontSize: "var(--text-3xl)", color }}
      >
        {score}
      </span>
      <div className="flex flex-col">
        <span
          className="font-pixel text-score-micro leading-none"
          style={{ color }}
        >
          {label}
        </span>
        <span className="mt-0.5 text-muted text-score-sm">/ 100</span>
      </div>
    </div>
  )
}

export { Badge, badgeVariants, ScoreBadge }
