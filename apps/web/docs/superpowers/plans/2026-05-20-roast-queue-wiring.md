# Roast Queue Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing-but-disconnected QStash queue infrastructure into the live `/api/roast` flow so that rate-limited providers (Mistral, Firecrawl) never surface errors to users — instead, jobs are serialized one at a time with queue position shown in the UI.

**Architecture:** `POST /api/roast` stops streaming and instead enqueues the job to Redis + triggers QStash, returning `202`. The client polls `/api/roast/status` for queue position updates, then switches to SSE relay when the worker starts streaming. On Mistral/Firecrawl 429, the worker resets state and returns 500 so QStash retries with backoff.

**Tech Stack:** Upstash Redis, Upstash QStash, Next.js App Router, `@ai-sdk/react` `useChat`, TypeScript

---

## File Map

| File | Change |
|---|---|
| `app/api/roast/route.ts` | Replace streaming with enqueue + QStash publish + 202 |
| `app/api/roast/worker/route.ts` | Add 429 detection + retry signaling + improved idempotency guard |
| `app/api/roast/status/route.ts` | Let `done` fall through to SSE relay (removes JSON early-return) |
| `lib/queue-transport.ts` | Handle 202, poll status, call `onQueuePosition` callback |
| `components/features/roast/roast-page.tsx` | Add `queuePosition` state, pass callback to transport, render `QueueStatus` |

---

## Task 1: POST /api/roast — Enqueue instead of stream

**Files:**
- Modify: `app/api/roast/route.ts`

- [ ] **Step 1: Replace the streaming section with enqueue + QStash trigger**

Open `app/api/roast/route.ts`. Replace the import line and everything from `const stream = createUIMessageStream(...)` to the end of the file:

```typescript
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

  // Enqueue: push to Redis queue + trigger QStash worker
  const position = await redis.rpush("roast:queue", host)
  await redis.set(`roast:${host}:status`, "queued")
  await redis.expire(`roast:${host}:status`, 10 * 60)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  await qstash.publishJSON({
    url: `${appUrl}/api/roast/worker`,
    body: { host },
    retries: 5,
  })

  return Response.json({ host, position }, { status: 202 })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter web tsc --noEmit 2>&1 | head -40
```

Expected: no errors on `app/api/roast/route.ts`.

- [ ] **Step 3: Commit**

```bash
cd /home/junbosque/roaster-ph && git add apps/web/app/api/roast/route.ts && git commit -m "feat: enqueue roast jobs via QStash instead of streaming directly"
```

---

## Task 2: Worker — 429 retry signaling

**Files:**
- Modify: `app/api/roast/worker/route.ts`

- [ ] **Step 1: Add `isRateLimitError` helper and update the worker**

Replace the full contents of `app/api/roast/worker/route.ts`:

```typescript
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
    await redis.expire(`roast:${host}:chunks`, 10 * 60)
    // Return 500 for rate limits (QStash retries), 200 for other errors (don't retry)
    return new Response(isRL ? "Rate limited" : "Internal error", {
      status: isRL ? 500 : 200,
    })
  }

  // Rate limit detected mid-stream: reset for QStash retry
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter web tsc --noEmit 2>&1 | head -40
```

Expected: no errors on `app/api/roast/worker/route.ts`.

- [ ] **Step 3: Commit**

```bash
cd /home/junbosque/roaster-ph && git add apps/web/app/api/roast/worker/route.ts && git commit -m "feat: add 429 retry signaling to roast worker"
```

---

## Task 3: Status endpoint — SSE relay for done state

**Files:**
- Modify: `app/api/roast/status/route.ts`

The status endpoint currently returns `{ status: "done" }` JSON when the worker finishes. But if the client polls and gets "queued", then polls again and the worker has already completed, it would receive JSON "done" with no chunks. We need it to SSE-relay all stored chunks even when status is already "done".

- [ ] **Step 1: Remove the JSON early-return for `done` so it falls through to SSE relay**

Replace the full contents of `app/api/roast/status/route.ts`:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter web tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /home/junbosque/roaster-ph && git add apps/web/app/api/roast/status/route.ts && git commit -m "feat: SSE relay for done state in status endpoint"
```

---

## Task 4: QueueAwareChatTransport — handle 202 and poll

**Files:**
- Modify: `lib/queue-transport.ts`

- [ ] **Step 1: Rewrite transport to handle 202 with polling loop**

Replace the full contents of `lib/queue-transport.ts`:

```typescript
import { DefaultChatTransport, UIMessage } from "ai"

interface RoastChatTransportOptions {
  host: string
  getTurnstileToken: () => string | null
  onQueuePosition?: (position: number | null) => void
}

export class RateLimitError extends Error {
  readonly reset: number
  readonly kind: "ip" | "global"

  constructor({ kind, reset }: { kind: "ip" | "global"; reset: number }) {
    super("rate_limit")
    this.name = "RateLimitError"
    this.reset = reset
    this.kind = kind
  }
}

export class QueueAwareChatTransport extends DefaultChatTransport<UIMessage> {
  private readonly host: string
  private readonly getTurnstileToken: () => string | null
  private readonly onQueuePosition?: (position: number | null) => void

  constructor({ host, getTurnstileToken, onQueuePosition }: RoastChatTransportOptions) {
    super()
    this.host = host
    this.getTurnstileToken = getTurnstileToken
    this.onQueuePosition = onQueuePosition
  }

  override async sendMessages(
    options: Parameters<InstanceType<typeof DefaultChatTransport<UIMessage>>["sendMessages"]>[0]
  ): ReturnType<InstanceType<typeof DefaultChatTransport<UIMessage>>["sendMessages"]> {
    const res = await fetch("/api/roast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-turnstile-token": this.getTurnstileToken() ?? "",
      },
      body: JSON.stringify({ host: this.host }),
      signal: options.abortSignal,
    })

    if (res.status === 429) {
      const data = await res.json() as { error: "ip" | "global"; reset: number }
      throw new RateLimitError({ kind: data.error, reset: data.reset })
    }

    // Cache hit: direct SSE stream
    if (res.ok && res.status === 200) {
      if (!res.body) throw new Error("Empty response body")
      return this.processResponseStream(res.body)
    }

    // Queued: poll status endpoint until streaming starts
    if (res.status === 202) {
      const { position: initialPosition } = await res.json() as { host: string; position: number }
      this.onQueuePosition?.(initialPosition)

      while (!options.abortSignal?.aborted) {
        await new Promise((r) => setTimeout(r, 1500))

        if (options.abortSignal?.aborted) break

        const pollRes = await fetch(
          `/api/roast/status?host=${encodeURIComponent(this.host)}`,
          { signal: options.abortSignal }
        )

        if (!pollRes.ok) {
          throw new Error(`Status poll failed: ${pollRes.status}`)
        }

        const contentType = pollRes.headers.get("content-type") ?? ""

        // Worker is streaming (or done with chunks): switch to SSE relay
        if (contentType.includes("text/event-stream")) {
          this.onQueuePosition?.(null)
          if (!pollRes.body) throw new Error("Empty stream body")
          return this.processResponseStream(pollRes.body)
        }

        const data = await pollRes.json() as {
          status: "queued" | "error" | "idle"
          position?: number
        }

        if (data.status === "queued" && data.position !== undefined) {
          this.onQueuePosition?.(data.position)
          continue
        }

        if (data.status === "error") {
          this.onQueuePosition?.(null)
          throw new Error("Roast failed. Please try again.")
        }

        // Unexpected status (idle): abort gracefully
        this.onQueuePosition?.(null)
        throw new Error("Queue session expired. Please refresh and try again.")
      }

      this.onQueuePosition?.(null)
      throw new Error("Request cancelled")
    }

    throw new Error(await res.text())
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter web tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /home/junbosque/roaster-ph && git add apps/web/lib/queue-transport.ts && git commit -m "feat: QueueAwareChatTransport polls queue position before streaming"
```

---

## Task 5: roast-page.tsx — render QueueStatus

**Files:**
- Modify: `components/features/roast/roast-page.tsx`

- [ ] **Step 1: Add `queuePosition` state and pass `onQueuePosition` to transport**

Add the import for `QueueStatus` near the top of `roast-page.tsx` (it's already imported from `./queue-status` — verify and add if missing):

In `components/features/roast/roast-page.tsx`, make three changes:

**Change A** — Add `QueueStatus` import (after existing imports):
```typescript
import { QueueStatus } from "@/components/features/roast/queue-status"
```

**Change B** — Add `queuePosition` state inside `RoastPage`, right after the `triggered`/`turnstileTokenRef`/`bottomRef` refs:
```typescript
const [queuePosition, setQueuePosition] = useState<number | null>(null)
```

**Change C** — Update the `transport` useMemo to pass `onQueuePosition`:
```typescript
const transport = useMemo(
  () =>
    new QueueAwareChatTransport({
      host,
      getTurnstileToken: () => turnstileTokenRef.current,
      onQueuePosition: setQueuePosition,
    }),
  [host]
)
```

**Change D** — Render `QueueStatus` between the metadata card and the rate limit banner. Find the comment `{/* Rate limit / error banner */}` and insert above it:
```typescript
{/* Queue position */}
{queuePosition !== null && (
  <QueueStatus position={queuePosition} />
)}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter web tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 3: Start dev server and manually verify the queue flow**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter web dev
```

Open the app in a browser, submit a roast for a host that hasn't been roasted before. Verify:
- Queue position card appears briefly (or immediately transitions to streaming if queue is empty)
- Roast text streams correctly
- Metrics appear after streaming completes
- Share CTA appears

- [ ] **Step 4: Commit**

```bash
cd /home/junbosque/roaster-ph && git add apps/web/components/features/roast/roast-page.tsx && git commit -m "feat: show queue position UI while waiting for roast worker"
```

---

## Task 6: Verify end-to-end in production-like conditions

- [ ] **Step 1: Check QStash env vars are set**

```bash
cd /home/junbosque/roaster-ph && grep -E "QSTASH_TOKEN|QSTASH_CURRENT|QSTASH_NEXT|NEXT_PUBLIC_APP_URL" .env.local 2>/dev/null || grep -E "QSTASH_TOKEN|QSTASH_CURRENT|QSTASH_NEXT|NEXT_PUBLIC_APP_URL" apps/web/.env.local 2>/dev/null || echo "Check your .env.local files"
```

Expected: all four variables present and non-empty.

- [ ] **Step 2: Test cached-host path still streams directly**

Submit a roast for a host that already has metrics in Supabase. Verify:
- No queue position card appears
- Roast streams immediately (no 202 → poll cycle)
- `POST /api/roast` returns 200, not 202

- [ ] **Step 3: Test rate limit error still surfaces correctly**

If you have a way to trigger the IP rate limit (2 requests in 12h), verify `RateLimitBanner` still appears with the correct reset time.

- [ ] **Step 4: Final commit (if any cleanup needed)**

```bash
cd /home/junbosque/roaster-ph && git add -p && git commit -m "chore: cleanup after queue wiring"
```
