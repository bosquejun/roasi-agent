import { getScoreTier } from "@roaster/ui/components/badge"

import { cn } from "@roaster/ui/lib/utils"

const TIER_HEX: Record<string, string> = {
  nuclear: "#E8231B",
  roasted: "#F47820",
  singed: "#F5C518",
  decent: "#C8F135",
  crispy: "#22C55E",
}

interface ScoreBarProps {
  score: number
  label: string
  compact?: boolean
  className?: string
}

function ScoreBar({ score, label, compact = false, className }: ScoreBarProps) {
  const tier = getScoreTier(score)
  const hex = TIER_HEX[tier]
  const pct = `${Math.min(100, Math.max(0, score))}%`

  return (
    <div
      className={cn(
        "flex items-center",
        compact ? "mb-sp-1 gap-sp-2" : "mb-sp-2 gap-sp-3",
        className
      )}
    >
      <div
        className={cn(
          "shrink-0 font-pixel text-muted-foreground uppercase",
          compact ? "text-score-micro" : "text-score-tiny"
        )}
        style={{ width: "var(--width-score-label)" }}
      >
        {label}
      </div>
      <div
        className={cn(
          "relative flex-1 border-[2px] border-black",
          compact ? "h-score-bar-compact" : "h-score-bar"
        )}
        style={{ background: "var(--ash)" }}
      >
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            width: pct,
            background: hex,
            transition: "width 600ms var(--ease-out)",
          }}
        />
      </div>
      <div
        className={cn(
          "text-right font-pixel",
          compact ? "text-score-micro" : "text-score-sm"
        )}
        style={{
          color: hex,
          width: compact
            ? "var(--width-score-value-compact)"
            : "var(--width-score-value)",
        }}
      >
        {score}
      </div>
    </div>
  )
}

interface ScoreBreakdownProps {
  design: number
  copy: number
  ux: number
  performance: number
  mobile: number
  compact?: boolean
  className?: string
}

function ScoreBreakdown({
  design,
  copy,
  ux,
  performance,
  mobile,
  compact = false,
  className,
}: ScoreBreakdownProps) {
  if (compact) {
    return (
      <div className={cn("border border-ash bg-smoke p-sp-3", className)}>
        <ScoreBar score={design} label="Design" compact />
        <ScoreBar score={copy} label="Copy" compact />
        <ScoreBar score={ux} label="UX/Flow" compact />
        <ScoreBar score={performance} label="Performance" compact />
        <ScoreBar score={mobile} label="Mobile" compact />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "border-[3px] border-black bg-bg-card p-sp-5 shadow-neo-md",
        className
      )}
    >
      <div className="mb-sp-4 font-pixel text-muted-foreground text-score-tiny uppercase tracking-md">
        Score Breakdown
      </div>
      <ScoreBar score={design} label="Design" />
      <ScoreBar score={copy} label="Copy" />
      <ScoreBar score={ux} label="UX/Flow" />
      <ScoreBar score={performance} label="Performance" />
      <ScoreBar score={mobile} label="Mobile" />
    </div>
  )
}

export { ScoreBar, ScoreBreakdown }
