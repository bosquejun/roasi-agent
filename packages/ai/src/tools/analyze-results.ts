import { tool } from "ai"
import { z } from "zod"
import { analyzeResults as runAnalysis } from "../skills/roaster-insights-skill/scripts/analyzeResults.js"

export const analyzeResults = tool({
  description:
    "Analyze Unlighthouse scan results from the given outputPath. Returns a structured report with scores, Core Web Vitals, failing audits, and worst pages. Always call scanSite first to get the outputPath.",
  inputSchema: z.object({
    outputPath: z
      .string()
      .describe("The output directory path returned by scanSite"),
  }),
  execute: async ({ outputPath }) => {
    try {
      const { report } = await runAnalysis(outputPath)
      return report
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) }
    }
  },
})
