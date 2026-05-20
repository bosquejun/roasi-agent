import { redis, pollRatelimit } from "@/lib/upstash"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")
  if (!host) return new Response("Missing host", { status: 400 })

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"

  const { success } = await pollRatelimit.limit(ip)
  if (!success) return new Response("Too many requests", { status: 429 })

  const status = await redis.get(`roast:${host}:status`)

  if (!status || status === "error") {
    return Response.json({ status: "idle" })
  }

  if (status === "done") {
    return Response.json({ status: "done" })
  }

  if (status === "queued") {
    const index = await redis.lpos("roast:queue", host)
    const position = index !== null ? index + 1 : 1
    return Response.json({ status: "queued", position })
  }

  // status === "streaming": relay SSE chunks from Redis
  const encoder = new TextEncoder()
  let offset = 0

  const relayStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      while (true) {
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
          // done but just flushed remaining — close
          controller.close()
          return
        }
      }
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
