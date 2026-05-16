import { spawn } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { tool } from "ai"
import { z } from "zod"

const __dirname = dirname(fileURLToPath(import.meta.url))
const WORKER_PATH = join(__dirname, "scan-worker.ts")

// tsx bin resolved relative to the monorepo root (works in dev and after build)
const TSX_BIN = join(__dirname, "../../../../../../node_modules/.bin/tsx")

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
  reportPath: string
}

function spawnScan(params: object): Promise<PageReport[]> {
  return new Promise((resolve, reject) => {
    const paramsJson = JSON.stringify(params)
    const proc = spawn(TSX_BIN, [WORKER_PATH, paramsJson], {
      stdio: ["ignore", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""
    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(stderr.trim() || `Scan subprocess exited with code ${code}`)
        )
        return
      }
      try {
        resolve(JSON.parse(stdout) as PageReport[])
      } catch {
        reject(
          new Error(`Failed to parse scan output: ${stdout.slice(0, 200)}`)
        )
      }
    })

    proc.on("error", reject)
  })
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

    const scopeConfig =
      mode === "targeted" && paths?.length
        ? MODES.targeted(paths)
        : mode === "smart"
          ? MODES.smart()
          : mode === "full"
            ? MODES.full()
            : MODES.default()

    const dateStamp = new Date().toISOString().slice(0, 10)
    const reportPath = `${parsed.hostname}/${dateStamp}`
    const outputPath = `./reports/${reportPath}`

    console.log(
      `[sitewarden:scan] Starting scan — url=${url} mode=${mode} device=${device}`
    )

    const pages = await spawnScan({ url, device, outputPath, scopeConfig })

    console.log(`[sitewarden:scan] Done — ${pages.length} page(s) collected`)

    return { pages, mode, reportPath }
  },
})
