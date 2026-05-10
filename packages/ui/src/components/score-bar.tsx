import * as React from "react"

import { cn } from "@roaster/ui/lib/utils"
import { getScoreTier } from "@roaster/ui/components/badge"

const TIER_FILL: Record<string, string> = {
  nuclear: "#E8231B",
  roasted: "#F47820",
  singed:  "#F5C518",
  decent:  "#C8F135",
  crispy:  "#22C55E",
}

interface ScoreBarProps {
  score: number
  label: string
  compact?: boolean
  className?: string
}

function ScoreBar({ score, label, compact = false, className }: ScoreBarProps) {
  const tier = getScoreTier(score)
  const fill = TIER_FILL[tier]
  const pct = `${Math.min(100, Math.max(0, score))}%`

  return (
    <div className={cn("flex items-center", className)} style={{ gap: 10, marginBottom: compact ? 5 : 8 }}>
      <div
        className="font-[family-name:var(--font-mono)] flex-shrink-0"
        style={{
          fontSize: compact ? 10 : 11,
          color: "var(--text-muted)",
          width: 80,
        }}
      >
        {label}
      </div>
      <div
        className="flex-1 relative"
        style={{
          height: compact ? 8 : 12,
          background: "var(--ash)",
          border: "2px solid var(--black)",
        }}
      >
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            width: pct,
            background: fill,
            transition: "width 600ms var(--ease-out)",
          }}
        />
      </div>
      <div
        className="font-[family-name:var(--font-pixel)] text-right"
        style={{
          fontSize: compact ? 7 : 8,
          color: fill,
          width: compact ? 24 : 32,
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
  const containerStyle: React.CSSProperties = compact
    ? {
        background: "var(--smoke)",
        padding: "10px 12px",
        border: "1px solid var(--ash)",
      }
    : {
        background: "var(--bg-card)",
        padding: 20,
        border: "var(--border-rule)",
        boxShadow: "var(--shadow-md)",
      }

  return (
    <div className={cn(className)} style={containerStyle}>
      {!compact && (
        <div
          className="font-[family-name:var(--font-pixel)] uppercase tracking-[0.1em]"
          style={{ fontSize: 9, color: "var(--text-muted)", marginBottom: 16 }}
        >
          Score Breakdown
        </div>
      )}
      <ScoreBar score={design}      label="Design"      compact={compact} />
      <ScoreBar score={copy}        label="Copy"        compact={compact} />
      <ScoreBar score={ux}          label="UX/Flow"     compact={compact} />
      <ScoreBar score={performance} label="Performance" compact={compact} />
      <ScoreBar score={mobile}      label="Mobile"      compact={compact} />
    </div>
  )
}

export { ScoreBar, ScoreBreakdown }
