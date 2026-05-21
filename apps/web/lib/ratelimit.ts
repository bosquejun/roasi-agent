import type { NextRequest } from "next/server"
import { globalRatelimit, hostRatelimit, ipRatelimit } from "@/lib/upstash"

const _IP_WINDOW_MS = 12 * 60 * 60 * 1000

type RatelimitResult =
  | { blocked: true; response: Response }
  | { blocked: false; ip: string; headers: Record<string, string> }

function rateLimitHeaders(
  reset: number,
  remaining: number,
  policy?: string,
  limit: number | string = 1
): Record<string, string> {
  const retryAfter = String(Math.ceil((reset - Date.now()) / 1000))
  const resetTime = String(Math.ceil(reset / 1000))

  return {
    "X-Retry-After": retryAfter,
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": resetTime,
    ...(policy && { "X-RateLimit-Policy": policy }),
  }
}

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
        headers: rateLimitHeaders(ipReset, 0, "ip"),
      }),
    }
  }

  if (hostRemaining <= 0) {
    return {
      blocked: true,
      response: new Response(null, {
        status: 429,
        headers: rateLimitHeaders(hostReset, 0, "host"),
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
        headers: rateLimitHeaders(globalReset, 0, "global", globalLimit),
      }),
    }
  }

  return {
    blocked: false,
    ip,
    headers: rateLimitHeaders(ipReset, ipRemaining),
  }
}

/** Call once the roast completes successfully to consume both IP and host tokens. */
export async function consumeRatelimit(
  ip: string,
  host: string
): Promise<void> {
  await Promise.all([ipRatelimit.limit(ip), hostRatelimit.limit(host)])
}
