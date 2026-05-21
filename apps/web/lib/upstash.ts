import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Module-level Maps persist across warm serverless invocations,
// reducing Redis round-trips for repeat requests from the same IP/host.
const ipCache = new Map<string, number>()
const hostCache = new Map<string, number>()
const globalCache = new Map<string, number>()

export const ipRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "12 h"),
  ephemeralCache: ipCache,
})

export const hostRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "3 d"),
  ephemeralCache: hostCache,
  prefix: "rl:host",
})

export const globalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(50, "1 m"),
  ephemeralCache: globalCache,
  prefix: "rl:global",
})
