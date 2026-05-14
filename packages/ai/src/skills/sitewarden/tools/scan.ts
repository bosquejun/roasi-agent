import {
  createUnlighthouse,
  type UnlighthouseRouteReport,
} from "@unlighthouse/core"
import { tool } from "ai"
import { writeFileSync } from "node:fs"
import { z } from "zod"

const NOISE_PATTERNS = [
  "/admin/*",
  "/api/*",
  "/cdn-cgi/*",
  "/wp-admin/*",
  "/wp-json/*",
  "/login",
  "/logout",
  "/auth/*",
  "*.xml",
  "*.json",
  "*.txt",
]

const MODES = {
  default: () => ({ include: ["/"] }),
  targeted: (paths: string[]) => ({ include: paths }),
  smart: () => ({ exclude: NOISE_PATTERNS, dynamicSampling: 10 }),
  full: () => ({
    exclude: NOISE_PATTERNS,
    dynamicSampling: 10,
    maxRoutes: 200,
  }),
} as const

type Mode = keyof typeof MODES

const BLOCKED_RANGES =
  /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.)/
const LOCAL_HOSTS = new Set(["localhost", "::1"])
const METADATA_HOSTS = new Set(["169.254.169.254", "metadata.google.internal"])

function checkHost(
  host: string,
  {
    allowedHosts = [],
    bypassSSRF = false,
  }: { allowedHosts?: string[]; bypassSSRF?: boolean } = {}
): { blocked: boolean; reason?: string; canOverride?: boolean } {
  if (METADATA_HOSTS.has(host)) {
    return {
      blocked: true,
      reason: `Cloud metadata endpoint is never allowed: ${host}`,
      canOverride: false,
    }
  }
  if (allowedHosts.includes(host)) return { blocked: false }
  if (LOCAL_HOSTS.has(host) || BLOCKED_RANGES.test(host)) {
    if (bypassSSRF) return { blocked: false }
    return {
      blocked: true,
      reason: `Non-public host blocked: ${host}. This may be a local or internal address.`,
      canOverride: true,
    }
  }
  return { blocked: false }
}

export interface PageReport {
  path: string
  scores: Record<string, { score: number | null }>
  audits: Record<
    string,
    { title: string; score: number | null; displayValue?: string }
  >
}

export interface ScanResult {
  pages: PageReport[]
  mode: Mode
}

export const scanTool = tool({
  description:
    "Scan a website with Unlighthouse/Lighthouse. Returns per-page scores and audit data. " +
    "SSRF-protected: non-public hosts are blocked unless explicitly allowed.",
  inputSchema: z.object({
    url: z.string().url().describe("Target URL to scan"),
    mode: z
      .enum(["default", "targeted", "smart", "full"])
      .default("default")
      .describe(
        "default=homepage only | targeted=specified paths | smart=sitemap-discovered | full=everything up to 200 routes"
      ),
    paths: z
      .array(z.string())
      .optional()
      .describe("Required when mode=targeted"),
    device: z.enum(["desktop", "mobile"]).default("desktop"),
    allowedHosts: z
      .array(z.string())
      .default([])
      .describe("Pre-approved non-public hosts"),
    bypassSSRF: z
      .boolean()
      .default(false)
      .describe(
        "Allow private hosts — only set after explicit user confirmation"
      ),
  }),
  execute: async ({
    url,
    mode,
    paths,
    device,
    allowedHosts,
    bypassSSRF,
  }): Promise<ScanResult> => {
    const parsed = new URL(url)

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error(`Invalid protocol: ${parsed.protocol}`)
    }

    const { blocked, reason } = checkHost(parsed.hostname, {
      allowedHosts,
      bypassSSRF,
    })
    if (blocked) throw new Error(reason)

    const scopeConfig = MODES.default()

    console.log(
      `[sitewarden:scan] Starting scan — url=${url} mode=${mode} device=${device}`
    )

    const unlighthouse = await createUnlighthouse(
      { site: url, scanner: { device, samples: 1, ...scopeConfig } },
      { name: "ci" }
    )

    await unlighthouse.setCiContext()

    const pages: PageReport[] = []

    unlighthouse.hooks.hook(
      "task-complete",
      (path: string, report: UnlighthouseRouteReport, taskName: string) => {
        if (taskName !== "runLighthouseTask") return
        const scores = (report.report?.categories ?? {}) as Record<
          string,
          { score: number | null }
        >
        const scoreStr = Object.entries(scores)
          .map(([k, v]) => `${k}=${Math.round((v?.score ?? 0) * 100)}`)
          .join(" ")
        console.log(`[sitewarden:scan] lighthouse complete — ${path} ${scoreStr}`)
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
      unlighthouse.hooks.hook("worker-finished", () => {
        resolve()
      })
    })

    console.log(`[sitewarden:scan] Done — ${pages.length} page(s) collected`)

    unlighthouse.worker.cluster.display.close = () => {}
    await unlighthouse.worker.cluster.close()
    unlighthouse.worker.clearProgressDisplay()
    console.log(`[sitewarden:scan] Cluster closed`)

    const debugPath = `/tmp/sitewarden-pages-${Date.now()}.json`
    writeFileSync(debugPath, JSON.stringify(pages, null, 2))
    console.log(`[sitewarden:scan] Pages saved to ${debugPath}`)

    return { pages, mode }
  },
})
