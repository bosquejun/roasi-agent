import { ScoreBadge } from "@roaster/ui/components/badge"
import { ScoreBreakdown } from "@roaster/ui/components/score-bar"

interface ReportViewerProps {
  overall?: number
  scores?: {
    design: number
    copy: number
    ux: number
    performance: number
    mobile: number
  }
}

export function ReportViewer({
  overall = 42,
  scores = { design: 38, copy: 55, ux: 40, performance: 30, mobile: 45 },
}: ReportViewerProps) {

  return (
    <div className="overflow-y-auto p-4 flex flex-col gap-4 h-full">
      <div>
        <div
          className="text-[var(--text-muted)] tracking-[0.1em] mb-2 uppercase"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
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