import { ScoreBadge } from "@roaster/ui/components/badge"
import { ScoreBreakdown } from "@roaster/ui/components/score-bar"

export function ReportViewer() {
  const overall = 42
  const scores = { design: 38, copy: 55, ux: 40, performance: 30, mobile: 45 }

  return (
    <div
      style={{
        overflowY: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          Overall Score
        </div>
        <ScoreBadge score={overall} />
      </div>
      <ScoreBreakdown
        design={scores.design}
        copy={scores.copy}
        ux={scores.ux}
        performance={scores.performance}
        mobile={scores.mobile}
      />
    </div>
  )
}
