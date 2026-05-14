import { tool } from "ai"
import { z } from "zod"
import type { AnalyzeResult, AuditFailure } from "./analyze.js"
import type { ScanResult } from "./scan.js"

export interface VerifyResult {
  improved: boolean
  delta: Record<string, number>
  newScores: Record<string, number>
  newFailures: AuditFailure[]
}

export const verifyTool = tool({
  description:
    "Re-scan affected pages after a fix and compare scores to baseline. " +
    "Always uses targeted mode — only re-scans pages the fix touched.",
  inputSchema: z.object({
    url: z.string().url().describe("Same URL used in the original scan"),
    paths: z.array(z.string()).describe("Page paths that were fixed"),
    baseline: z
      .record(z.number())
      .describe(
        "Category scores from the original analyze (e.g. { performance: 72 })"
      ),
  }),
  execute: async ({ url, paths, baseline }): Promise<VerifyResult> => {
    // Dynamic import avoids circular deps while keeping types available
    const { scanTool } = await import("./scan.js")
    const { analyzeTool } = await import("./analyze.js")

    const scanResult = (await scanTool.execute!(
      {
        url,
        mode: "targeted",
        paths,
        device: "desktop",
        allowedHosts: [],
        bypassSSRF: false,
      },
      {} as any
    )) as ScanResult

    const { summary: newScores, failures: newFailures } =
      (await analyzeTool.execute!(
        { pages: scanResult.pages },
        {} as any
      )) as AnalyzeResult

    const delta: Record<string, number> = {}
    for (const [cat, score] of Object.entries(newScores)) {
      delta[cat] = score - (baseline[cat] ?? 0)
    }

    const improved = Object.values(delta).every((d) => d >= 0)

    return { improved, delta, newScores, newFailures }
  },
})
