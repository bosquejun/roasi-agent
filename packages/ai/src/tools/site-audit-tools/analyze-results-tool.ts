import { tool } from "ai"
import { z } from "zod"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

interface AnalyzeResultsOutput {
  report: object
  markdown: string
}

async function loadAnalyzeResults() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const scriptPath = resolve(__dirname, "../../skills/site-audit/scripts/analyzeResults.js")
  const module = await import(scriptPath)
  return module.analyzeResults as (outputDir: string) => Promise<AnalyzeResultsOutput>
}

export const analyzeResultsTool = tool({
  description:
    "Parse Unlighthouse scan output and produce a structured site audit report. Call this after scanSite has completed. Returns category scores, Core Web Vitals, worst pages, and failing audits ready for analysis.",
  inputSchema: z.object({
    outputPath: z
      .string()
      .describe("Path to the Unlighthouse output directory (e.g., .unlighthouse-output)"),
  }),
  execute: async ({ outputPath }) => {
    try {
      const analyzeResults = await loadAnalyzeResults()
      const { report, markdown } = await analyzeResults(outputPath)
      return {
        success: true,
        report,
        markdown,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: message,
        hint: "Ensure the scan has completed before running analyzeResults. Use scanSite first.",
      }
    }
  },
})