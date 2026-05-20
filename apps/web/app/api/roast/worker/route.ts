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

function isRateLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const status = (err as { status?: number; statusCode?: number }).status
    ?? (err as { status?: number; statusCode?: number }).statusCode
  if (status === 429) return true
  const msg = err.message.toLowerCase()
  return msg.includes("rate limit") || msg.includes("429") || msg.includes("too many requests")
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

  if (!host || typeof host !== "string") {
    return new Response("Invalid payload", { status: 400 })
  }

  // Idempotency: skip if already done. If "streaming" with no chunks, allow retry
  // (previous attempt failed before producing output).
  const [currentStatus, existingChunkCount] = await Promise.all([
    redis.get(`roast:${host}:status`),
    redis.llen(`roast:${host}:chunks`),
  ])
  if (currentStatus === "done") {
    return new Response("Already processed", { status: 200 })
  }
  if (currentStatus === "streaming" && existingChunkCount > 0) {
    return new Response("Already processing", { status: 200 })
  }

  await redis.lrem("roast:queue", 1, host)
  await redis.set(`roast:${host}:status`, "streaming")
  await redis.expire(`roast:${host}:status`, 10 * 60)
  await redis.expire(`roast:${host}:chunks`, 10 * 60)

  let rateLimitDetected = false

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
            if (isRateLimitError(error)) {
              rateLimitDetected = true
            }
            return msg
          },
          generateMessageId: generateId,
          onFinish({ messages }) {
            for (const message of messages) {
              for (const part of message.parts) {
                if (
                  part.type.includes("roastMetricsTool") &&
                  (part as { state?: string }).state === "output-available"
                ) {
                  storeRoastMetrics(host, (part as { output: RoastMetrics }).output).catch(
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
    const remaining = decoder.decode()
    if (remaining) {
      await redis.rpush(`roast:${host}:chunks`, remaining)
    }
  } catch (err) {
    console.error("[worker] stream read error", err)
    const isRL = isRateLimitError(err)
    await redis.set(`roast:${host}:status`, isRL ? "queued" : "error")
    await redis.expire(`roast:${host}:status`, 10 * 60)
    if (isRL) {
      await redis.del(`roast:${host}:chunks`)
    } else {
      await redis.expire(`roast:${host}:chunks`, 10 * 60)
    }
    // Return 500 for rate limits (QStash retries), 200 for other errors (don't retry)
    return new Response(isRL ? "Rate limited" : "Internal error", {
      status: isRL ? 500 : 200,
    })
  }

  // Rate limit detected mid-stream via onError: reset for QStash retry
  if (rateLimitDetected) {
    await redis.set(`roast:${host}:status`, "queued")
    await redis.expire(`roast:${host}:status`, 10 * 60)
    await redis.del(`roast:${host}:chunks`)
    return new Response("Rate limited, retrying", { status: 500 })
  }

  await redis.set(`roast:${host}:status`, "done")
  const ttl = 10 * 60
  await redis.expire(`roast:${host}:status`, ttl)
  await redis.expire(`roast:${host}:chunks`, ttl)

  return new Response("OK", { status: 200 })
}
