import { roastAgent } from "@roaster/ai/agents/roasi/roast.agent"
import { setActiveStreamId, storeStream } from "@roaster/ai/tools/memory"
import { createClient } from "@supabase/supabase-js"
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai"
import type { NextRequest } from "next/server"
import { verifyTurnstile } from "@/lib/turnstile"

interface RoastMetrics {
  cringeScore: number
  delusionIndex: number
  audacityLevel: number
  embarrassmentRadius: number
}

async function storeRoastMetrics(host: string, metrics: RoastMetrics) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  await supabase
    .from("scrape_cache")
    .upsert(
      { cache_key: `${host}:roast-metrics`, data: metrics },
      { onConflict: "cache_key" }
    )
}

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const { host } = (await req.json()) as { host: string }
  const turnstileToken = req.headers.get("x-turnstile-token")

  if (!host) return new Response("Missing host", { status: 400 })

  if (!turnstileToken) {
    return new Response("Missing verification token", { status: 403 })
  }

  try {
    await verifyTurnstile(turnstileToken)
  } catch {
    return new Response("Verification failed", { status: 403 })
  }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const agent = await roastAgent()

      const result = await agent.stream({
        prompt: `Roast this startup's landing page ${host}. Seven beats. No mercy. Sige na.`,
      })

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          sendSources: true,
          onError: (error) => {
            return error instanceof Error ? error.message : String(error)
          },
          generateMessageId: generateId,
          onFinish({ messages }) {
            for (const message of messages) {
              for (const part of message.parts) {
                if (
                  part.type.includes("roastMetricsTool") &&
                  (part as any).state === "output-available"
                ) {
                  const metrics = (part as any).output as RoastMetrics
                  storeRoastMetrics(host, metrics).catch(console.error)
                }
              }
            }
          },
        })
      )
    },
  })

  return createUIMessageStreamResponse({
    stream,
    consumeSseStream({ stream: sseStream }) {
      const streamId = generateId()
      setActiveStreamId(host, streamId).catch(console.error)
      const writer = storeStream(streamId, host)
      ;(async () => {
        const reader = sseStream.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            writer.write(value)
          }
        } catch (err) {
          console.error("[stream-store] read error:", err)
        } finally {
          writer.end()
        }
      })()
    },
  })
}
