import { redis, ipRatelimit, globalRatelimit, qstash } from "@/lib/upstash"
import { isTurnstileEnabled, verifyTurnstile } from "@/lib/turnstile"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const { host } = (await req.json()) as { host: string }
  const turnstileToken = req.headers.get("x-turnstile-token")

  if (!host) return new Response("Missing host", { status: 400 })

  if (!/^[a-zA-Z0-9.-]{1,253}$/.test(host)) {
    return new Response("Invalid host", { status: 400 })
  }

  // Turnstile FIRST — no Redis touched before this passes
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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"

  const { success: ipOk } = await ipRatelimit.limit(ip)
  if (!ipOk) {
    return new Response("Rate limit exceeded: too many roasts from your IP", {
      status: 429,
    })
  }

  const { success: globalOk } = await globalRatelimit.limit("global")
  if (!globalOk) {
    return new Response("Rate limit exceeded: server is busy, try again later", {
      status: 429,
    })
  }

  // Check if host is already processing or done
  const existingStatus = await redis.get(`roast:${host}:status`)
  if (existingStatus === "streaming") {
    return Response.json({ status: "streaming" })
  }
  if (existingStatus === "done") {
    return Response.json({ status: "done" })
  }

  // Dedup: if already in queue, return current position
  const existingIndex = await redis.lpos("roast:queue", host)
  if (existingIndex !== null) {
    return Response.json({ status: "queued", position: existingIndex + 1 })
  }

  // Enqueue
  await redis.set(`roast:${host}:status`, "queued")
  const queueLength = await redis.rpush("roast:queue", host)

  await qstash.queue({ queueName: "roast-queue" }).enqueue({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/roast/worker`,
    body: JSON.stringify({ host }),
    headers: { "Content-Type": "application/json" },
    timeout: 300,
  })

  return Response.json({ status: "queued", position: queueLength })
}
