import { roastAgent } from "@roaster/ai/agents/roasi/roast.agent"
import { cachedModel } from "@roaster/ai/model"
import { roastMetricsSchema } from "@roaster/ai/tools/roast-metrics"
import { UnsupportedSiteError } from "@roaster/ai/tools/roast-site"
import {
  APICallError,
  createUIMessageStream,
  generateId,
  generateText,
  Output,
  type UIMessageChunk,
} from "ai"
import { getStepMetadata, getWritable, RetryableError } from "workflow"
import { supabase } from "@/lib/supabase"
import { consumeRatelimit } from "../ratelimit"

type WorkflowProps = {
  host: string
  clientIp: string
}

async function roastAgentStep({ host }: WorkflowProps) {
  "use step"

  const metadata = getStepMetadata()

  const writable = getWritable<UIMessageChunk>()
  const writer = writable.getWriter()

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const agent = await roastAgent()
      const result = await agent.stream({
        prompt: `Roast this website ${host}. No mercy.`,
      })

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          sendSources: true,
          onError: (error: unknown) => {
            const msg = error instanceof Error ? error.message : String(error)
            console.error("[/api/roast] stream error", msg)
            return msg
          },
          generateMessageId: generateId,
        })
      )
    },
  })

  let roastText = ""
  for await (const chunk of stream as unknown as AsyncIterable<UIMessageChunk>) {
    switch (chunk.type) {
      case "text-delta":
        roastText += chunk.delta
        break
      case "error": {
        const { errorText } = chunk
        if (errorText.includes("Rate limit exceeded")) {
          const retryAfter = Math.ceil(metadata.attempt ** 2 * 8_000)

          throw new RetryableError(
            `Roasting Error due to rate limit. Backing off for ${retryAfter / 1000}s...`,
            {
              retryAfter,
            }
          )
        }
        if (
          errorText.toLowerCase().includes("do not support this site") ||
          errorText.toLowerCase().includes("unsupportedsiteerror") ||
          errorText.toLowerCase().includes("site not supported")
        ) {
          throw new UnsupportedSiteError(errorText)
        }
        break
      }
    }
    await writer.write(chunk)
  }

  writer.releaseLock()

  return roastText
}

async function generateMetricsStep(host: string, roastText: string) {
  "use step"
  const metadata = getStepMetadata()
  const writable = getWritable<UIMessageChunk>()
  const writer = writable.getWriter()
  try {
    const { output } = await generateText({
      model: cachedModel,
      output: Output.object({
        schema: roastMetricsSchema,
      }),
      prompt: `You just roasted ${host}. Here is the roast:\n\n${roastText}\n\nScore each metric 0–100 based on what was described. Higher is worse. Do not soften scores.`,
    })

    const toolCallId = generateId()
    writer.write({
      type: "tool-input-available",
      toolCallId,
      toolName: "roastMetricsTool",
      input: output,
    })
    writer.write({ type: "tool-output-available", toolCallId, output })

    // Persist metrics for OG image generation
    await supabase
      .from("scrape_cache")
      .upsert(
        { cache_key: `${host}:roast-metrics`, data: output },
        { onConflict: "cache_key" }
      )
  } catch (error) {
    if (error instanceof APICallError && error.statusCode === 429) {
      const retryAfter = Math.ceil(metadata.attempt ** 2 * 8_000)

      throw new RetryableError(
        `Roast metrics error due to rate limit. Backing off for ${retryAfter / 1000}s...`,
        {
          retryAfter,
        }
      )
    }
  } finally {
    await writer.close()
  }
}

async function consumeRateLimitsStep({ clientIp, host }: WorkflowProps) {
  "use step"

  await consumeRatelimit(clientIp, host)
}

export async function startRoastWorkflow(props: WorkflowProps) {
  "use workflow"

  const roastText = await roastAgentStep(props)

  await generateMetricsStep(props.host, roastText)

  await consumeRateLimitsStep(props)
}
