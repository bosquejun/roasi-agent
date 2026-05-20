import { roastAgent } from "@roaster/ai/agents/roasi/roast.agent"
import { redis } from "@/lib/upstash"
import { createClient } from "@supabase/supabase-js"
import { Receiver } from "@upstash/qstash"
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

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

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
})

export async function POST(req: NextRequest) {
  const signature = req.headers.get("upstash-signature") ?? ""
  const bodyText = await req.text()

  try {
    await receiver.verify({ signature, body: bodyText, url: req.url })
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }

  const { host } = JSON.parse(bodyText) as { host: string }

  // Idempotency guard: QStash retries on failure. Skip if already processed.
  const currentStatus = await redis.get(`roast:${host}:status`)
  if (currentStatus === "streaming" || currentStatus === "done") {
    return new Response("Already processed", { status: 200 })
  }

  await redis.lrem("roast:queue", 1, host)
  await redis.set(`roast:${host}:status`, "streaming")

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
          onError: (error: unknown) => {
            const msg = error instanceof Error ? error.message : String(error)
            console.error("[worker] stream error", msg)
            return msg
          },
          generateMessageId: generateId,
          onFinish({ messages }) {
            for (const message of messages) {
              for (const part of message.parts) {
                if (
                  part.type.includes("roastMetricsTool") &&
                  (part as any).state === "output-available"
                ) {
                  storeRoastMetrics(host, (part as any).output as RoastMetrics).catch(
                    console.error
                  )
                }
              }
            }
          },
        })
      )
    },
  })

  const sseResponse = createUIMessageStreamResponse({ stream })
  const decoder = new TextDecoder()
  const reader = sseResponse.body!.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      await redis.rpush(`roast:${host}:chunks`, text)
    }
  } catch (err) {
    console.error("[worker] stream read error", err)
    await redis.set(`roast:${host}:status`, "error")
    const ttl = 10 * 60
    await redis.expire(`roast:${host}:status`, ttl)
    await redis.expire(`roast:${host}:chunks`, ttl)
    return new Response("Internal error", { status: 500 })
  }

  await redis.set(`roast:${host}:status`, "done")
  const ttl = 10 * 60
  await redis.expire(`roast:${host}:status`, ttl)
  await redis.expire(`roast:${host}:chunks`, ttl)

  return new Response("OK", { status: 200 })
}
