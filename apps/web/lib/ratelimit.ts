import type { NextRequest } from "next/server"
import { globalRatelimit, hostRatelimit, ipRatelimit } from "@/lib/upstash"

type RatelimitResult =
  | { blocked: true; response: Response }
  | { blocked: false; ip: string; headers: Record<string, string> }

function extractIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"
  )
}

export async function checkRatelimit(
  req: NextRequest,
  host: string
): Promise<RatelimitResult> {
  const ip = extractIp(req)

  // Check without consuming — tokens are only spent after a successful roast
  const [
    { remaining: ipRemaining, reset: ipReset },
    { remaining: hostRemaining, reset: hostReset },
  ] = await Promise.all([
    ipRatelimit.getRemaining(ip),
    hostRatelimit.getRemaining(host),
  ])

  if (ipRemaining <= 0) {
    return {
      blocked: true,
      response: new Response(null, {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((ipReset - Date.now()) / 1000)),
          "X-RateLimit-Limit": "1",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(ipReset / 1000)),
          "X-RateLimit-Policy": "ip",
        },
      }),
    }
  }

  if (hostRemaining <= 0) {
    return {
      blocked: true,
      response: new Response(null, {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((hostReset - Date.now()) / 1000)),
          "X-RateLimit-Limit": "1",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(hostReset / 1000)),
          "X-RateLimit-Policy": "host",
        },
      }),
    }
  }

  const {
    success: globalOk,
    limit: globalLimit,
    reset: globalReset,
  } = await globalRatelimit.limit("global")

  if (!globalOk) {
    return {
      blocked: true,
      response: new Response(null, {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((globalReset - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(globalLimit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(globalReset / 1000)),
          "X-RateLimit-Policy": "global",
        },
      }),
    }
  }

  return {
    blocked: false,
    ip,
    headers: {
      "X-RateLimit-Limit": "1",
      "X-RateLimit-Remaining": String(ipRemaining),
      "X-RateLimit-Reset": String(Math.ceil(ipReset / 1000)),
    },
  }
}

/** Call once the roast completes successfully to consume both IP and host tokens. */
export async function consumeRatelimit(ip: string, host: string): Promise<void> {
  await Promise.all([ipRatelimit.limit(ip), hostRatelimit.limit(host)])
}
