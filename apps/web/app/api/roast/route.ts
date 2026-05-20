import { roastAgent } from "@roaster/ai/agents/roasi/roast.agent"
import { setActiveStreamId, storeStream } from "@roaster/ai/tools/memory"
import { createClient } from "@supabase/supabase-js"
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai"
import type { NextRequest } from "next/server"
import { isTurnstileEnabled, verifyTurnstile } from "@/lib/turnstile"

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

  console.log("[roast] POST start", { host, hasTurnstileToken: !!turnstileToken })

  if (!host) return new Response("Missing host", { status: 400 })

  if (isTurnstileEnabled()) {
    if (!turnstileToken) {
      console.warn("[roast] missing turnstile token")
      return new Response("Missing verification token", { status: 403 })
    }
    try {
      await verifyTurnstile(turnstileToken)
      console.log("[roast] turnstile verified")
    } catch (err) {
      console.error("[roast] turnstile verification failed", err)
      return new Response("Verification failed", { status: 403 })
    }
  }

  console.log("[roast] creating UI message stream")
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      console.log("[roast] execute start — creating agent")
      const agent = await roastAgent()
      console.log("[roast] agent created — calling agent.stream()")

      const result = await agent.stream({
        prompt: `Roast this startup's landing page ${host}. Seven beats. No mercy. Sige na.`,
      })
      console.log("[roast] agent.stream() returned — merging into writer")

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          sendSources: true,
          onError: (error) => {
            const msg = error instanceof Error ? error.message : String(error)
            console.error("[roast] stream error", msg)
            return msg
          },
          generateMessageId: generateId,
          onFinish({ messages }) {
            console.log(`[roast] onFinish — messages: ${messages.length}`)
            for (const message of messages) {
              for (const part of message.parts) {
                if (
                  part.type.includes("roastMetricsTool") &&
                  (part as any).state === "output-available"
                ) {
                  const metrics = (part as any).output as RoastMetrics
                  console.log("[roast] storing metrics for", host, metrics)
                  storeRoastMetrics(host, metrics).catch(console.error)
                }
              }
            }
          },
        })
      )
    },
  })

  console.log("[roast] returning createUIMessageStreamResponse")
  return createUIMessageStreamResponse({
    stream,
    consumeSseStream({ stream: sseStream }) {
      const streamId = generateId()
      console.log("[roast] consumeSseStream called — streamId:", streamId)
      setActiveStreamId(host, streamId).catch(console.error)
      const writer = storeStream(streamId, host)
      ;(async () => {
        const reader = sseStream.getReader()
        let chunkCount = 0
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              console.log(`[roast] SSE stream done — total chunks: ${chunkCount}`)
              break
            }
            chunkCount++
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
