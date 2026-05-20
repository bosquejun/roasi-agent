import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { Client as QStashClient } from "@upstash/qstash"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Module-level Maps persist across warm serverless invocations,
// reducing Redis round-trips for repeat requests from the same IP.
const ipCache = new Map<string, number>()
const globalCache = new Map<string, number>()
const pollCache = new Map<string, number>()

export const ipRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "12 h"),
  ephemeralCache: ipCache,
})

export const globalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(50, "1 m"),
  ephemeralCache: globalCache,
  prefix: "rl:global",
})

export const pollRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(60, "1 m"),
  ephemeralCache: pollCache,
  prefix: "rl:poll",
})

export const qstash = new QStashClient({
  token: process.env.QSTASH_TOKEN!,
})
