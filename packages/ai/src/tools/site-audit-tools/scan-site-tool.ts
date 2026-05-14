import { tool } from "ai"
import { exec } from "child_process"
import { promisify } from "util"
import { z } from "zod"

const execAsync = promisify(exec)

export const scanSiteTool = tool({
  description:
    "Run an Unlighthouse site audit scan. Must be called before analyzeResults. Produces a JSON report at the specified output path.",
  inputSchema: z.object({
    site: z
      .string()
      .describe("The URL of the site to scan (must be publicly reachable)"),
    outputPath: z
      .string()
      .default("./.unlighthouse-output")
      .describe("Directory to store scan results"),
    desktop: z.boolean().default(false).describe("Run desktop scan instead of mobile"),
    enableJavascript: z
      .boolean()
      .default(false)
      .describe("Enable JavaScript (for SPAs like React, Vue, Angular, Next.js)"),
    samples: z
      .number()
      .default(1)
      .describe("Number of samples per page (higher = more accurate but slower)"),
    urls: z
      .array(z.string())
      .optional()
      .describe("Specific URLs to scan (default: whole site via sitemap)"),
    maxRoutes: z.number().optional().describe("Maximum routes to scan on large sites"),
  }),
  execute: async ({
    site,
    outputPath,
    desktop,
    enableJavascript,
    samples,
    urls,
    maxRoutes,
  }) => {
    const args = [
      `npx unlighthouse-ci --site ${site}`,
      `--reporter json`,
      `--output-path ${outputPath}`,
    ]

    if (desktop) args.push("--desktop")
    if (enableJavascript) args.push("--enable-javascript", "--disable-sitemap")
    if (samples > 1) args.push(`--samples ${samples}`, "--throttle", "--no-cache")
    if (urls?.length) args.push(`--urls ${urls.join(",")}`)
    if (maxRoutes) args.push(`--max-routes ${maxRoutes}`)

    const command = args.join(" ")

    try {
      await execAsync(command, { maxBuffer: 50 * 1024 * 1024 })
      return {
        success: true,
        outputPath,
        message: `Scan completed. Run analyzeResults with outputPath="${outputPath}" to parse results.`,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: message,
        hint: "Check that Chrome is installed and the site URL is accessible. See references/troubleshooting.md in the site-audit skill.",
      }
    }
  },
})