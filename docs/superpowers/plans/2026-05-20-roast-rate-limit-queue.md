# Roast Rate Limiting & Queueing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Upstash rate limiting, FIFO queueing, and Redis-backed streaming relay to `/api/roast` so roasts run one at a time globally, IPs are capped to 2 per 12 hours, and clients see live queue position before seamlessly transitioning into streaming.

**Architecture:** `POST /api/roast` enqueues a QStash FIFO job and returns queue position. `GET /api/roast/status` either returns JSON position or an SSE stream relayed from Redis chunks. `POST /api/roast/worker` (QStash callback) runs the agent, writes SSE bytes to Redis as they arrive, then returns 200 OK. The frontend extends `DefaultChatTransport` to poll the status endpoint internally, updating queue position UI via callback, then returning the SSE `ReadableStream<UIMessageChunk>` to `useChat` for normal stream rendering.

**Tech Stack:** `@upstash/redis`, `@upstash/ratelimit`, `@upstash/qstash`, Next.js 16 App Router, AI SDK v4 (`DefaultChatTransport`)

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| **Create** | `apps/web/lib/upstash.ts` | Singleton Redis, Ratelimit, QStash clients |
| **Rewrite** | `apps/web/app/api/roast/route.ts` | POST-only: Turnstile → rate limit → dedup → enqueue |
| **Create** | `apps/web/app/api/roast/status/route.ts` | GET: JSON position or SSE relay from Redis |
| **Create** | `apps/web/app/api/roast/worker/route.ts` | POST: QStash callback, runs agent, writes Redis chunks |
| **Create** | `apps/web/lib/queue-transport.ts` | `QueueAwareChatTransport` extends `DefaultChatTransport` |
| **Create** | `apps/web/components/features/roast/queue-status.tsx` | Queue position display component |
| **Modify** | `apps/web/components/features/roast/roast-page.tsx` | Wire up transport + queue position state |

---

## Task 1: Install Upstash packages

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install the three Upstash packages**

```bash
cd apps/web && pnpm add @upstash/redis @upstash/ratelimit @upstash/qstash
```

Expected output: packages added to `apps/web/package.json` and `pnpm-lock.yaml`.

- [ ] **Step 2: Verify TypeScript can find the types**

```bash
cd apps/web && pnpm typecheck 2>&1 | head -20
```

Expected: no new errors related to `@upstash/*`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore: add @upstash/redis, ratelimit, qstash to apps/web"
```

---

## Task 2: Create Upstash client singletons

**Files:**
- Create: `apps/web/lib/upstash.ts`

- [ ] **Step 1: Write `apps/web/lib/upstash.ts`**

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { Client as QStashClient } from "@upstash/qstash"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Module-level Maps persist across warm serverless invocations,
// reducing Redis round-trips for repeat requests from the same IP.
const ipCache = new Map()
const globalCache = new Map()
const pollCache = new Map()

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
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck 2>&1 | grep "upstash\|lib/upstash"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/upstash.ts
git commit -m "feat: add upstash redis, ratelimit, and qstash client singletons"
```

---

## Task 3: Create the QStash worker endpoint

This endpoint is called by QStash (one at a time, FIFO). It runs the roast agent, writes raw SSE bytes to Redis as they arrive, then returns 200 OK so QStash dequeues the next job.

**Files:**
- Create: `apps/web/app/api/roast/worker/route.ts`

- [ ] **Step 1: Write `apps/web/app/api/roast/worker/route.ts`**

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

  // Idempotency guard: QStash retries on failure. Skip if already processed.
  const currentStatus = await redis.get(`roast:${host}:status`)
  if (currentStatus === "streaming" || currentStatus === "done") {
    return new Response("Already processed", { status: 200 })
  }

  await redis.lrem("roast:queue", 1, host)
  await redis.set(`roast:${host}:status`, "streaming")

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
            return msg
          },
          generateMessageId: generateId,
          onFinish({ messages }) {
            for (const message of messages) {
              for (const part of message.parts) {
                if (
                  part.type.includes("roastMetricsTool") &&
                  (part as any).state === "output-available"
                ) {
                  storeRoastMetrics(host, (part as any).output as RoastMetrics).catch(
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
  } catch (err) {
    console.error("[worker] stream read error", err)
    await redis.set(`roast:${host}:status`, "error")
    const ttl = 10 * 60
    await redis.expire(`roast:${host}:status`, ttl)
    await redis.expire(`roast:${host}:chunks`, ttl)
    return new Response("Internal error", { status: 500 })
  }

  await redis.set(`roast:${host}:status`, "done")
  const ttl = 10 * 60
  await redis.expire(`roast:${host}:status`, ttl)
  await redis.expire(`roast:${host}:chunks`, ttl)

  return new Response("OK", { status: 200 })
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck 2>&1 | grep "worker"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/api/roast/worker/route.ts
git commit -m "feat: add QStash worker endpoint for roast processing"
```

---

## Task 4: Create the status / stream relay endpoint

Returns JSON position when queued, or an SSE stream (relaying Redis chunks) when streaming has started.

**Files:**
- Create: `apps/web/app/api/roast/status/route.ts`

- [ ] **Step 1: Write `apps/web/app/api/roast/status/route.ts`**

```typescript
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
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck 2>&1 | grep "status"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/api/roast/status/route.ts
git commit -m "feat: add roast status/stream relay endpoint"
```

---

## Task 5: Rewrite `POST /api/roast` as enqueue-only

Strips all streaming logic. Now does: Turnstile → rate limits → dedup → QStash enqueue.

**Files:**
- Rewrite: `apps/web/app/api/roast/route.ts`

- [ ] **Step 1: Replace `apps/web/app/api/roast/route.ts` entirely**

```typescript
import { redis, ipRatelimit, globalRatelimit } from "@/lib/upstash"
import { qstash } from "@/lib/upstash"
import { isTurnstileEnabled, verifyTurnstile } from "@/lib/turnstile"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const { host } = (await req.json()) as { host: string }
  const turnstileToken = req.headers.get("x-turnstile-token")

  if (!host) return new Response("Missing host", { status: 400 })

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
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck 2>&1 | grep "api/roast"
```

Expected: no errors.

- [ ] **Step 3: Smoke-test enqueue locally (requires env vars)**

```bash
curl -X POST http://localhost:3000/api/roast \
  -H "Content-Type: application/json" \
  -d '{"host":"example.com"}'
```

Expected: `{"status":"queued","position":1}`

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/api/roast/route.ts
git commit -m "feat: rewrite POST /api/roast as queue enqueue with rate limiting"
```

---

## Task 6: Create `QueueAwareChatTransport`

Extends `DefaultChatTransport` from the AI SDK. Overrides `sendMessages` to: enqueue → poll → return SSE stream from `/api/roast/status` back to `useChat`.

**Files:**
- Create: `apps/web/lib/queue-transport.ts`

- [ ] **Step 1: Write `apps/web/lib/queue-transport.ts`**

```typescript
import { DefaultChatTransport } from "ai"

interface QueueAwareChatTransportOptions {
  host: string
  getTurnstileToken: () => string | null
  onQueueUpdate: (position: number | null) => void
}

export class QueueAwareChatTransport extends DefaultChatTransport {
  private host: string
  private getTurnstileToken: () => string | null
  private onQueueUpdate: (position: number | null) => void

  constructor(opts: QueueAwareChatTransportOptions) {
    super()
    this.host = opts.host
    this.getTurnstileToken = opts.getTurnstileToken
    this.onQueueUpdate = opts.onQueueUpdate
  }

  override async sendMessages(
    options: Parameters<InstanceType<typeof DefaultChatTransport>["sendMessages"]>[0]
  ): ReturnType<InstanceType<typeof DefaultChatTransport>["sendMessages"]> {
    const { host, getTurnstileToken, onQueueUpdate } = this

    // Step 1: Enqueue
    const enqueueRes = await fetch("/api/roast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-turnstile-token": getTurnstileToken() ?? "",
      },
      body: JSON.stringify({ host }),
      signal: options.abortSignal,
    })

    if (!enqueueRes.ok) {
      throw new Error(await enqueueRes.text())
    }

    const enqueueData = (await enqueueRes.json()) as {
      status: string
      position?: number
    }

    if (enqueueData.status === "streaming") {
      // Already streaming from a previous request — connect immediately
      onQueueUpdate(null)
      return this.connectToStatus(host, options.abortSignal)
    }

    if (enqueueData.status === "queued" && enqueueData.position) {
      onQueueUpdate(enqueueData.position)
    }

    // Step 2: Poll until streaming starts
    while (true) {
      await new Promise<void>((r) => setTimeout(r, 2000))

      if (options.abortSignal?.aborted) {
        throw new DOMException("Aborted", "AbortError")
      }

      const statusRes = await fetch(
        `/api/roast/status?host=${encodeURIComponent(host)}`,
        { signal: options.abortSignal }
      )

      if (
        statusRes.ok &&
        statusRes.headers.get("content-type")?.includes("text/event-stream")
      ) {
        onQueueUpdate(null)
        // Hand the SSE body to DefaultChatTransport's SSE parser
        return this.processResponseStream(statusRes.body!)
      }

      if (statusRes.ok) {
        const statusData = (await statusRes.json()) as {
          status: string
          position?: number
        }
        if (statusData.status === "queued" && statusData.position !== undefined) {
          onQueueUpdate(statusData.position)
        }
      }
    }
  }

  private connectToStatus(
    host: string,
    signal: AbortSignal | undefined
  ): ReturnType<InstanceType<typeof DefaultChatTransport>["sendMessages"]> {
    return fetch(`/api/roast/status?host=${encodeURIComponent(host)}`, {
      signal,
    }).then((res) => {
      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        return this.processResponseStream(res.body!)
      }
      throw new Error("Roast not currently streaming")
    })
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck 2>&1 | grep "queue-transport"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/queue-transport.ts
git commit -m "feat: add QueueAwareChatTransport for polling then streaming"
```

---

## Task 7: Create the queue position UI component

**Files:**
- Create: `apps/web/components/features/roast/queue-status.tsx`

- [ ] **Step 1: Write `apps/web/components/features/roast/queue-status.tsx`**

```tsx
import { IconFlame } from "@tabler/icons-react"

interface QueueStatusProps {
  position: number
}

const ordinal = (n: number) => {
  if (n === 1) return "1st"
  if (n === 2) return "2nd"
  if (n === 3) return "3rd"
  return `${n}th`
}

export function QueueStatus({ position }: QueueStatusProps) {
  return (
    <div className="flex flex-col items-center gap-4 border-[3px] border-foreground bg-card p-8 shadow-neo-md text-center">
      <IconFlame className="size-10 animate-pulse text-fire-orange" />
      <div className="flex flex-col gap-1">
        <p className="font-pixel text-xl uppercase text-foreground">
          You&apos;re {ordinal(position)} in line
        </p>
        <p className="font-mono text-sm text-slate">
          {position === 1
            ? "You're next — hang tight..."
            : `${position - 1} roast${position - 1 === 1 ? "" : "s"} ahead of you`}
        </p>
      </div>
      <p className="font-mono text-xs text-stone">
        We roast one at a time. No shortcuts.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck 2>&1 | grep "queue-status"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/features/roast/queue-status.tsx
git commit -m "feat: add queue position display component"
```

---

## Task 8: Wire everything into `RoastPage`

Replace `DefaultChatTransport` with `QueueAwareChatTransport`. Add queue position state. Show `QueueStatus` while queued.

**Files:**
- Modify: `apps/web/components/features/roast/roast-page.tsx`

- [ ] **Step 1: Add queue transport and state — replace the transport instantiation and add position state**

Find this block (lines ~139–149 in `roast-page.tsx`):

```typescript
  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/roast",
      prepareSendMessagesRequest() {
        return {
          body: { host },
          headers: { "x-turnstile-token": turnstileTokenRef.current ?? "" },
        }
      },
    }),
  })
```

Replace with:

```typescript
  const [queuePosition, setQueuePosition] = useState<number | null>(null)

  const transport = useMemo(
    () =>
      new QueueAwareChatTransport({
        host,
        getTurnstileToken: () => turnstileTokenRef.current,
        onQueueUpdate: setQueuePosition,
      }),
    [host]
  )

  const { messages, status, sendMessage } = useChat({ transport })
```

- [ ] **Step 2: Add imports at the top of `roast-page.tsx`**

Add to the existing import block:

```typescript
import { QueueAwareChatTransport } from "@/lib/queue-transport"
import { QueueStatus } from "@/components/features/roast/queue-status"
```

Remove the `DefaultChatTransport` import from `"ai"` (it's no longer used directly).

- [ ] **Step 3: Show `QueueStatus` in the JSX**

In the JSX, find the `{/* Roast Content */}` section. Add `QueueStatus` just before it (around line 245):

```tsx
      {/* Queue position — shown while waiting for a slot */}
      {queuePosition !== null && <QueueStatus position={queuePosition} />}

      {/* Roast Content */}
```

- [ ] **Step 4: Typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/features/roast/roast-page.tsx
git commit -m "feat: wire QueueAwareChatTransport into RoastPage with queue position UI"
```

---

## Task 9: QStash queue setup + environment variables

**Files:**
- None (external configuration)

- [ ] **Step 1: Add required environment variables to your deployment**

Add these to Vercel project settings (or `.env.local` for local dev):

```
UPSTASH_REDIS_REST_URL=<from Upstash console>
UPSTASH_REDIS_REST_TOKEN=<from Upstash console>
QSTASH_TOKEN=<from Upstash QStash console>
QSTASH_CURRENT_SIGNING_KEY=<from Upstash QStash console>
QSTASH_NEXT_SIGNING_KEY=<from Upstash QStash console>
```

`NEXT_PUBLIC_APP_URL` must already be set (used as the worker callback URL for QStash).

- [ ] **Step 2: Create the QStash FIFO queue named `roast-queue`**

In the [Upstash QStash console](https://console.upstash.com/qstash), create a queue:
- **Name:** `roast-queue`
- **Parallelism:** `1` (critical — this enforces one-at-a-time processing)

Or via the QStash HTTP API:

```bash
curl -X POST "https://qstash.upstash.io/v2/queues" \
  -H "Authorization: Bearer $QSTASH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"queueName":"roast-queue","parallelism":1}'
```

- [ ] **Step 3: For local development — expose your dev server to QStash**

QStash needs to reach your worker endpoint. Use a tunnel:

```bash
# Option A: ngrok
ngrok http 3000
# Then set NEXT_PUBLIC_APP_URL=https://<ngrok-id>.ngrok.io in .env.local

# Option B: Vercel dev
# Deploy to Vercel preview; QStash calls the preview URL
```

- [ ] **Step 4: End-to-end smoke test**

Start dev server:
```bash
cd apps/web && pnpm dev
```

Enqueue a roast:
```bash
curl -X POST http://localhost:3000/api/roast \
  -H "Content-Type: application/json" \
  -d '{"host":"vercel.com"}'
# Expected: {"status":"queued","position":1}
```

Poll status (before QStash processes it):
```bash
curl "http://localhost:3000/api/roast/status?host=vercel.com"
# Expected: {"status":"queued","position":1}
```

After QStash triggers the worker and sets status to `streaming`:
```bash
curl "http://localhost:3000/api/roast/status?host=vercel.com"
# Expected: SSE stream of roast chunks
```

- [ ] **Step 5: Commit env var documentation**

```bash
git add .env.example 2>/dev/null || true
git commit -m "docs: add Upstash/QStash env vars to .env.example" --allow-empty
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Per-IP rate limit: 2/12h sliding window — Task 2 + Task 5
- ✅ Global rate limit: 50/min fixed window — Task 2 + Task 5
- ✅ Turnstile before any Redis — Task 5 (strict order enforced)
- ✅ `ephemeralCache` on all Ratelimit instances — Task 2
- ✅ QStash FIFO queue, one-at-a-time — Task 9 (parallelism: 1)
- ✅ jobId = `roast:{host}` (deterministic from host) — Tasks 3, 4, 5
- ✅ Dedup: re-POST returns current position — Task 5
- ✅ Queue position display — Tasks 6, 7, 8
- ✅ Status endpoint: JSON when queued, SSE when streaming — Task 4
- ✅ Worker idempotency guard for QStash retries — Task 3
- ✅ 10-min TTL on all `roast:{host}:*` keys after completion — Task 3
- ✅ Worker returns 200 only after stream complete (QStash waits) — Task 3
- ✅ Metrics storage preserved in worker — Task 3
- ✅ Seamless transition from JSON polling to SSE in transport — Task 6
