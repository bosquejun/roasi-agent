import { tool } from "ai"
import { z } from "zod"

export interface FixResult {
  applied: boolean
  description: string
  diff?: string
}

type FixHandler = (input: {
  page: string
  context: Record<string, string>
}) => Promise<{ description: string; diff: string }>

const fixHandlers: Record<string, FixHandler> = {
  "image-alt": async () => ({
    description: "Add alt attributes to images missing them",
    diff: '- <img src="hero.jpg">\n+ <img src="hero.jpg" alt="Hero image">',
  }),

  "document-title": async ({ context }) => ({
    description: "Add missing <title> tag to page",
    diff: `- <head>\n+ <head>\n+   <title>${context["suggestedTitle"] ?? "Page Title"}</title>`,
  }),

  "meta-description": async ({ context }) => ({
    description: "Add missing meta description",
    diff: `+ <meta name="description" content="${context["suggestedDescription"] ?? "Page description"}">`,
  }),
}

export const fixTool = tool({
  description:
    "Apply a targeted fix for a single Lighthouse audit failure. " +
    "One audit ID per call — never batches. Use analyze output to determine which audit to fix.",
  inputSchema: z.object({
    auditId: z
      .string()
      .describe(
        'Lighthouse audit ID to fix (e.g. "image-alt", "document-title")'
      ),
    page: z.string().describe("Page path the failure was found on"),
    context: z
      .record(z.string())
      .default({})
      .describe("Optional hints (suggestedTitle, suggestedDescription, etc.)"),
  }),
  execute: async ({ auditId, page, context }): Promise<FixResult> => {
    const handler = fixHandlers[auditId]

    if (!handler) {
      return {
        applied: false,
        description: `No fix handler registered for audit: ${auditId}. Add one to fix-handlers.md.`,
      }
    }

    try {
      const result = await handler({ page, context })
      return { applied: true, ...result }
    } catch (err) {
      return {
        applied: false,
        description: `Fix failed: ${(err as Error).message}`,
      }
    }
  },
})
