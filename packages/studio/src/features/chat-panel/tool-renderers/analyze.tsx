import { getScoreTier } from "@roaster/ui/components/badge"
import { cn } from "@roaster/ui/lib/utils"
import { DefaultToolRenderer } from "./default"
import type { ToolRendererProps } from "./types"

interface AuditFailure {
  page: string
  tier: 1 | 2 | 3
}

interface AnalyzeResult {
  summary: Record<string, number>
  failures: AuditFailure[]
  passing: string[]
}

const CATEGORY_ORDER = ["performance", "accessibility", "best-practices", "seo", "pwa"]

const CATEGORY_LABELS: Record<string, string> = {
  performance: "Performance",
  accessibility: "Accessibility",
  "best-practices": "Best Practices",
  seo: "SEO",
  pwa: "PWA",
}

// Bar fill — singed/decent darkened so they read against the ash track in light mode
const BAR_COLOR: Record<string, string> = {
  nuclear: "#E8231B",
  roasted: "#F47820",
  singed:  "#D4A017",
  decent:  "#7BB800",
  crispy:  "#22C55E",
}

// Score text — darker variants for singed/decent which are invisible on cream
const TEXT_COLOR: Record<string, string> = {
  nuclear: "#E8231B",
  roasted: "#F47820",
  singed:  "#A07800",
  decent:  "#5A7A00",
  crispy:  "#22C55E",
}

const TIER_LABEL: Record<string, string> = {
  nuclear: "💀 Nuclear",
  roasted: "🔥 Roasted",
  singed:  "😬 Singed",
  decent:  "👍 Decent",
  crispy:  "⭐ Crispy",
}

const TIER_BG: Record<string, string> = {
  nuclear: "bg-fire-red-soft",
  roasted: "bg-fire-org-soft",
  singed:  "bg-fire-yel-soft",
  decent:  "bg-acid-soft",
  crispy:  "bg-score-crispy-soft",
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

export function AnalyzeToolRenderer({ part, messageId }: ToolRendererProps) {
  if (part.state !== "output-available" || !part.output) {
    return <DefaultToolRenderer part={part} messageId={messageId} />
  }

  const result = part.output as AnalyzeResult
  const { summary, failures, passing } = result

  const orderedCategories = CATEGORY_ORDER.filter((k) => k in summary)
  const overall = avg(Object.values(summary))
  const overallTier = getScoreTier(overall)

  const failingPages = new Set(failures.map((f) => f.page)).size
  const totalPages = passing.length + failingPages
  const criticalCount = failures.filter((f) => f.tier === 1).length

  return (
    <div key={`${messageId}-${part.toolCallId}`} className="border-[3px] border-black bg-bg-card shadow-neo-md">

      {/* Header */}
      <div className="flex items-center justify-between border-b-[3px] border-black px-sp-4 py-sp-3">
        <span
          className="uppercase tracking-widest text-muted-foreground"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
        >
          Scan Results
        </span>
        <div className="flex items-center gap-sp-2">
          <span
            className="font-pixel leading-none"
            style={{ fontSize: 13, color: TEXT_COLOR[overallTier] }}
          >
            {overall}
          </span>
          <span
            className={cn("border-[2px] border-black px-sp-2 py-[3px]", TIER_BG[overallTier])}
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: TEXT_COLOR[overallTier] }}
          >
            {TIER_LABEL[overallTier]}
          </span>
        </div>
      </div>

      {/* Score rows */}
      <div className="px-sp-4 py-sp-3 space-y-sp-2">
        {orderedCategories.map((cat) => {
          const score = summary[cat] ?? 0
          const tier = getScoreTier(score)
          const barColor = BAR_COLOR[tier]
          const textColor = TEXT_COLOR[tier]

          return (
            <div key={cat} className="flex items-center gap-sp-3">
              {/* Label — wide enough for "Best Practices" at pixel font */}
              <span
                className="shrink-0 text-muted-foreground"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 7, width: 116 }}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </span>

              {/* Bar track */}
              <div
                className="relative flex-1 border-[2px] border-black"
                style={{ height: 10, background: "var(--ash)" }}
              >
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: `${Math.min(100, Math.max(0, score))}%`,
                    background: barColor,
                    transition: "width 600ms var(--ease-out)",
                  }}
                />
              </div>

              {/* Score number */}
              <span
                className="shrink-0 text-right font-pixel tabular-nums"
                style={{ fontSize: 10, color: textColor, width: 28 }}
              >
                {score}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-sp-4 border-t-[2px] border-ash bg-smoke px-sp-4 py-sp-2">
        <StatChip value={totalPages} label="pages" />
        <Dot />
        <StatChip value={passing.length} label="passing" color="#22C55E" />
        <Dot />
        <StatChip value={failures.length} label="issues" color={failures.length > 0 ? "#F47820" : undefined} />
        {criticalCount > 0 && (
          <>
            <Dot />
            <StatChip value={criticalCount} label="critical" color="#E8231B" />
          </>
        )}
      </div>
    </div>
  )
}

function StatChip({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div className="flex items-baseline gap-[5px]">
      <span
        className="font-pixel tabular-nums leading-none"
        style={{ fontSize: 10, color: color ?? "var(--charcoal)" }}
      >
        {value}
      </span>
      <span
        className="text-muted-foreground"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}
      >
        {label}
      </span>
    </div>
  )
}

function Dot() {
  return <span className="text-ash" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>·</span>
}
