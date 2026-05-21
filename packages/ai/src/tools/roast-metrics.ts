import { z } from "zod"

export const roastMetricsSchema = z.object({
  cringeScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Overall embarrassment level of the site (0 = fine, 100 = unwatchable)"),
  delusionIndex: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Gap between what the site claims to be and what was actually shipped"),
  audacityLevel: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("The sheer nerve of shipping this publicly"),
  embarrassmentRadius: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("How far the cringe spreads — does it affect the builder's reputation, their team, their industry"),
})

export type RoastMetrics = z.infer<typeof roastMetricsSchema>
