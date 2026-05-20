import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { isTurnstileEnabled, verifyTurnstile } from "@/lib/turnstile"
import { globalRatelimit, ipRatelimit, qstash, redis } from "@/lib/upstash"
import { roastAgent } from "@roaster/ai/agents/roasi/roast.agent"
import { createUIMessageStream, createUIMessageStreamResponse, generateId } from "ai"

async function hasRoastMetrics(host: string): Promise<boolean> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from("scrape_cache")
    .select("cache_key")
    .eq("cache_key", `${host}:roast-metrics`)
    .maybeSingle()
  return data !== null
}

export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function POST(req: NextRequest) {
  let host: string
  try {
    const body = (await req.json()) as { host?: unknown }
    host = typeof body.host === "string" ? body.host : ""
  } catch {
    return new Response("Invalid JSON body", { status: 400 })
  }

  if (!host) return new Response("Missing host", { status: 400 })

  if (
    !/^[a-zA-Z0-9.-]{1,253}$/.test(host) ||
    host.startsWith(".") ||
    host.includes("..")
  ) {
    return new Response("Invalid host", { status: 400 })
  }

  const turnstileToken = req.headers.get("x-turnstile-token")

  if (isTurnstileEnabled()) {
    if (!turnstileToken) {
      return new Response("Missing verification token", { status: 403 })
    }
    try {
      await verifyTurnstile(turnstileToken)
    } catch {
      return new Response("Verification failed", { status: 403 })
    }
  }

  // Cache hit: stream immediately, no queue needed.
  const cached = await hasRoastMetrics(host)

  if (cached) {
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
              console.error("[/api/roast] stream error", msg)
              return msg
            },
            generateMessageId: generateId,
          })
        )
      },
    })
    return createUIMessageStreamResponse({ stream })
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"

  const { success: ipOk, reset: ipReset } = await ipRatelimit.limit(ip)
  if (!ipOk) {
    return Response.json({ error: "ip", reset: ipReset }, { status: 429 })
  }

  const { success: globalOk, reset: globalReset } = await globalRatelimit.limit("global")
  if (!globalOk) {
    return Response.json({ error: "global", reset: globalReset }, { status: 429 })
  }

  // Idempotency guard: check if host is already queued/streaming
  const existingStatus = await redis.get(`roast:${host}:status`)
  if (existingStatus === "queued" || existingStatus === "streaming") {
    const index = await redis.lpos("roast:queue", host)
    const position = index !== null ? index + 1 : 1
    return Response.json({ host, position }, { status: 202 })
  }

  // Check that NEXT_PUBLIC_APP_URL is configured
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    console.error("[/api/roast] NEXT_PUBLIC_APP_URL is not set")
    return new Response("Server misconfiguration", { status: 500 })
  }

  // Enqueue: push to Redis queue + trigger QStash worker
  const position = await redis.rpush("roast:queue", host)
  await redis.set(`roast:${host}:status`, "queued", { ex: 10 * 60 })
  await redis.expire("roast:queue", 60 * 60) // 1-hour rolling TTL

  try {
    await qstash.publishJSON({
      url: `${appUrl}/api/roast/worker`,
      body: { host },
      retries: 5,
    })
  } catch (err) {
    console.error("[/api/roast] QStash publish failed", err)
    await redis.lrem("roast:queue", 1, host)
    await redis.del(`roast:${host}:status`)
    return new Response("Failed to enqueue job", { status: 502 })
  }

  return Response.json({ host, position }, { status: 202 })
}
