import { tool } from "ai"
import { z } from "zod"

export const roastMetricsTool = tool({
  description:
    "Emit structured roast metrics after writing the roast. Call this once with scores derived from the scraped site content.",
  inputSchema: z.object({
    cringeScore: z
      .number()
      .min(0)
      .max(100)
      .describe("Overall embarrassment level of the site (0 = fine, 100 = unwatchable)"),
    delusionIndex: z
      .number()
      .min(0)
      .max(100)
      .describe("Gap between what the site claims to be and what was actually shipped"),
    audacityLevel: z
      .number()
      .min(0)
      .max(100)
      .describe("The sheer nerve of shipping this publicly"),
    embarrassmentRadius: z
      .number()
      .min(0)
      .max(100)
      .describe("How far the cringe spreads — does it affect the builder's reputation, their team, their industry"),
  }),
  execute: async (metrics) => metrics,
})

export type RoastMetrics = {
  cringeScore: number
  delusionIndex: number
  audacityLevel: number
  embarrassmentRadius: number
}
