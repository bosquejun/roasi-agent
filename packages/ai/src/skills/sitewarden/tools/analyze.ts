import { tool } from "ai"
import { z } from "zod"

const TIER_1 = new Set([
  "is-crawlable",
  "meta-description",
  "document-title",
  "largest-contentful-paint",
  "cumulative-layout-shift",
  "interactive",
])
const TIER_2 = new Set([
  "color-contrast",
  "image-alt",
  "uses-webp-images",
  "render-blocking-resources",
  "unused-javascript",
  "unused-css-rules",
])

function getTier(id: string): 1 | 2 | 3 {
  if (TIER_1.has(id)) return 1
  if (TIER_2.has(id)) return 2
  return 3
}

export interface AuditFailure {
  page: string
  auditId: string
  title: string
  description: string | undefined
  score: number
  tier: 1 | 2 | 3
}

export interface AnalyzeResult {
  summary: Record<string, number>
  failures: AuditFailure[]
  passing: string[]
}

const pageSchema = z.object({
  path: z.string(),
  scores: z.record(z.object({ score: z.number().nullable() })),
  audits: z
    .record(
      z.object({
        title: z.string(),
        description: z.string().optional().default(""),
        score: z.number().nullable(),
      })
    )
    .optional(),
})

export const analyzeTool = tool({
  description:
    "Analyze scan output and return prioritized audit failures grouped by impact priority. " +
    "Priority 1 = Top Priorities (SEO/UX critical), Priority 2 = High Impact (broad wins), Priority 3 = Enhancements (nice-to-have).",
  inputSchema: z.object({
    pages: z.array(pageSchema).describe("Output from the scan tool"),
  }),
  execute: async ({ pages }): Promise<AnalyzeResult> => {
    const failures: AuditFailure[] = []

    for (const page of pages) {
      for (const [id, audit] of Object.entries(page.audits ?? {})) {
        if (audit.score !== null && audit.score < 0.9) {
          failures.push({
            page: page.path,
            auditId: id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            tier: getTier(id),
          })
        }
      }
    }

    failures.sort((a, b) => a.tier - b.tier || a.score - b.score)

    const categoryTotals: Record<string, number[]> = {}
    for (const page of pages) {
      for (const [cat, data] of Object.entries(page.scores ?? {})) {
        if (!categoryTotals[cat]) categoryTotals[cat] = []
        categoryTotals[cat].push(data.score ?? 0)
      }
    }

    const summary: Record<string, number> = {}
    for (const [cat, scores] of Object.entries(categoryTotals)) {
      summary[cat] = Math.round(
        (scores.reduce((a, b) => a + b, 0) / scores.length) * 100
      )
    }

    const failingPaths = new Set(failures.map((f) => f.page))
    const passing = pages.map((p) => p.path).filter((p) => !failingPaths.has(p))

    return { summary, failures, passing }
  },
})
