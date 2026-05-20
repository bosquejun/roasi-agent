import { redis, pollRatelimit } from "@/lib/upstash"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")
  if (!host) return new Response("Missing host", { status: 400 })

  if (!/^[a-zA-Z0-9.-]{1,253}$/.test(host)) {
    return new Response("Invalid host", { status: 400 })
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"

  const { success } = await pollRatelimit.limit(ip)
  if (!success) return new Response("Too many requests", { status: 429 })

  const status = await redis.get(`roast:${host}:status`)

  if (!status) {
    return Response.json({ status: "idle" })
  }
  if (status === "error") {
    return Response.json({ status: "error" })
  }

  if (status === "queued") {
    const index = await redis.lpos("roast:queue", host)
    const position = index !== null ? index + 1 : 1
    return Response.json({ status: "queued", position })
  }

  // status === "streaming" or "done": relay all chunks via SSE.
  // "done" falls through here so clients that poll after the worker finishes
  // still receive all stored chunks before the stream closes.
  const encoder = new TextEncoder()
  let offset = 0
  let cancelled = false

  const relayStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (!cancelled) {
          const [currentStatus, chunks] = await Promise.all([
            redis.get(`roast:${host}:status`),
            redis.lrange(`roast:${host}:chunks`, offset, -1),
          ])

          for (const chunk of chunks as string[]) {
            controller.enqueue(encoder.encode(chunk))
            offset++
          }

          const isDone =
            currentStatus === "done" || currentStatus === "error" || !currentStatus
          if (isDone && (chunks as string[]).length === 0) {
            controller.close()
            return
          }

          if (!isDone) {
            await new Promise((r) => setTimeout(r, 100))
          } else {
            controller.close()
            return
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[status] relay stream error", err)
          controller.error(err)
        }
      }
    },
    cancel() {
      cancelled = true
    },
  })

  return new Response(relayStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
