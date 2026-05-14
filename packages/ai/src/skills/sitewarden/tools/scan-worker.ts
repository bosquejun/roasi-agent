/**
 * Standalone subprocess entry point for Unlighthouse scans.
 * Spawned fresh per scan to avoid unctx "Context conflict" from loggerCtx being a
 * module-level singleton that Unlighthouse never unsets between scans.
 *
 * Usage: node --import tsx/esm scan-worker.ts '<json-params>'
 * Output: JSON result written to stdout on success; non-zero exit on failure.
 */

import {
  createUnlighthouse,
  type UnlighthouseRouteReport,
} from "@unlighthouse/core"
import { writeFileSync } from "node:fs"

interface ScanParams {
  url: string
  device: "desktop" | "mobile"
  outputPath: string
  scopeConfig: { include?: string[]; exclude?: string[]; dynamicSampling?: number; maxRoutes?: number }
}

interface PageReport {
  path: string
  scores: Record<string, { score: number | null }>
  audits: Record<string, { title: string; score: number | null; displayValue?: string }>
}

const raw = process.argv[2]
if (!raw) {
  process.stderr.write("Missing params argument\n")
  process.exit(1)
}

const params: ScanParams = JSON.parse(raw)

async function run() {
  const unlighthouse = await createUnlighthouse(
    {
      site: params.url,
      scanner: { device: params.device, samples: 1, ...params.scopeConfig },
      outputPath: params.outputPath,
    },
    { name: "ci" }
  )

  await unlighthouse.setCiContext()

  const pages: PageReport[] = []

  unlighthouse.hooks.hook(
    "task-complete",
    (path: string, report: UnlighthouseRouteReport, taskName: string) => {
      if (taskName !== "runLighthouseTask") return
      const scores = (report.report?.categories ?? {}) as Record<string, { score: number | null }>
      const rawAudits = (report.report?.audits ?? {}) as Record<
        string,
        { title: string; score: number | null; displayValue?: string }
      >
      const audits = Object.fromEntries(
        Object.entries(rawAudits).map(([id, a]) => [
          id,
          { title: a.title, score: a.score, displayValue: a.displayValue },
        ])
      )
      pages.push({ path, scores, audits })
    }
  )

  await unlighthouse.start()

  await new Promise<void>((resolve) => {
    unlighthouse.hooks.hook("worker-finished", () => resolve())
  })

  unlighthouse.worker.cluster.display.close = () => {}
  await unlighthouse.worker.cluster.close()
  unlighthouse.worker.clearProgressDisplay()

  const debugPath = `/tmp/sitewarden-pages-${Date.now()}.json`
  writeFileSync(debugPath, JSON.stringify(pages, null, 2))

  process.stdout.write(JSON.stringify(pages))
}

run().catch((err) => {
  process.stderr.write(`Scan failed: ${err?.message ?? err}\n`)
  process.exit(1)
})
