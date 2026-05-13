import { tool } from "ai"
import { execSync } from "child_process"
import { createHash } from "crypto"
import { z } from "zod"

function checkPrerequisites(): string | null {
  try {
    const version = execSync("node --version", { encoding: "utf-8" }).trim()
    const major = parseInt(version.replace("v", "").split(".")[0] ?? "0", 10)
    if (major < 18) return `Node >= 18 is required. Current version: ${version}`
  } catch {
    return "Node not found. Ensure Node.js >= 18 is installed."
  }

  try {
    execSync("npx --version", { encoding: "utf-8" })
  } catch {
    return "npx not found. Ensure Node.js is installed correctly."
  }

  const chromeFound = (() => {
    for (const cmd of ["google-chrome --version", "chromium-browser --version"]) {
      try {
        execSync(cmd, { encoding: "utf-8" })
        return true
      } catch {}
    }
    return false
  })()

  if (!chromeFound) {
    return "Chrome/Chromium not found. Install Puppeteer: npm install -g @unlighthouse/cli puppeteer"
  }

  return null
}

export function deriveOutputPath(url: string): string {
  const hash = createHash("md5").update(url).digest("hex").slice(0, 8)
  return `/tmp/roaster-${hash}`
}

export const scanSite = tool({
  description:
    "Scan a website using Unlighthouse. Checks prerequisites, runs the scan, and returns outputPath for use with analyzeResults.",
  inputSchema: z.object({
    url: z.string().describe("The website URL to scan"),
  }),
  execute: async ({ url }) => {
    const prereqError = checkPrerequisites()
    if (prereqError) return { error: prereqError }

    const outputPath = deriveOutputPath(url)
    try {
      execSync(
        `npx unlighthouse-ci --site ${url} --output-path ${outputPath} --reporter jsonExpanded`,
        { stdio: "inherit" }
      )
      return { outputPath }
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) }
    }
  },
})
