# Roast Rate Limiting & Queueing Design

**Date:** 2026-05-20  
**Status:** Approved

## Overview

Add Upstash-powered rate limiting, FIFO queueing, and streaming relay to `/api/roast` so that roasting jobs run one at a time globally, each IP is capped to 2 roasts per 12 hours, and the global throughput cap is 50 requests per minute. Clients see their queue position in real time and transition seamlessly into streaming when their job begins.

---

## Services

| Service | Purpose |
|---|---|
| **Upstash Redis** | Queue list, job status, stream chunk storage |
| **Upstash Ratelimit** | Per-IP + global rate limiting with `ephemeralCache` |
| **Upstash QStash** | FIFO callback queue — one worker call at a time |

### New packages

- `@upstash/redis`
- `@upstash/ratelimit`
- `@upstash/qstash`

---

## Redis Data Model

```
roast:queue              → List    — FIFO ordered list of hosts awaiting processing
roast:{host}:status      → String  — 'queued' | 'streaming' | 'done' | 'error'
roast:{host}:chunks      → List    — SSE chunk strings written by worker as they arrive
```

- JobId is deterministic: `roast:{host}` — no explicit jobId passed to clients.
- All `roast:{host}:*` keys get a 10-minute TTL set when worker marks the job `done` or `error`.
- `roast:queue` is self-maintaining: each worker removes its host entry on start.

---

## Endpoints

### `POST /api/roast` — enqueue (always full guard)

**Request body:** `{ host: string }`

**Guard order (strict — no Redis touched before Turnstile passes):**

1. **Turnstile verify** — Cloudflare challenge, no Redis. 403 on failure.
2. **IP rate limit** — Upstash Ratelimit, sliding window, 2 per 12h, with `ephemeralCache`. 429 on failure.
3. **Global rate limit** — Upstash Ratelimit, fixed window, 50 per minute, with `ephemeralCache`. 429 on failure.
4. **Dedup check** — `LPOS roast:queue {host}`. If host already queued, return current position without re-enqueueing.
5. **Enqueue** — `SET roast:{host}:status queued`, `RPUSH roast:queue {host}` (returns new list length = position), publish QStash job `{host}`.
6. **Return** `{ status: 'queued', position: N }`

---

### `GET /api/roast/status?host=X` — poll or stream

**Guard:** IP rate limit only, Ratelimit fixed window 60 per minute with `ephemeralCache`. Mostly served from memory — Redis not touched until auth passes.

**Logic:**

1. Read `roast:{host}:status` from Redis.
2. Branch:
   - **`queued`** → `LPOS roast:queue {host}` + 1 → return JSON `{ status: 'queued', position: N }`
   - **`streaming`** → return SSE response (`Content-Type: text/event-stream`). Poll `roast:{host}:chunks` list with a tracked offset, relay each chunk to client. Close stream when `roast:{host}:status` = `done`.
   - **`done`** → return JSON `{ status: 'done' }`
   - **missing / error** → return JSON `{ status: 'idle' }`

**Client distinguishes mode by response `Content-Type`:** JSON = still waiting, SSE = streaming has begun.

---

### `POST /api/roast/worker` — QStash callback

**Guard:** QStash signature verification via `@upstash/qstash` receiver. Reject unsigned requests with 401.

**Steps:**

1. Parse `{ host }` from body.
2. `LREM roast:queue 1 {host}` — remove from queue.
3. `SET roast:{host}:status streaming`.
4. Run `roastAgent()` and stream the result.
5. On each SSE chunk: `RPUSH roast:{host}:chunks <chunk>`.
6. On `onFinish`: store roast metrics (existing behavior), `SET roast:{host}:status done`, apply 10-minute TTL to all `roast:{host}:*` keys.
7. On error: `SET roast:{host}:status error`, apply TTL.

---

## Client Flow

```
POST /api/roast { host }
  ← { status: 'queued', position: 3 }
    UI: "You're #3 in queue"

poll GET /api/roast/status?host=X every 2s
  ← { status: 'queued', position: 2 }  →  "You're #2 in queue"
  ← { status: 'queued', position: 1 }  →  "You're next..."
  ← Content-Type: text/event-stream    →  switch to streaming render
     tokens arrive and render as usual
```

---

## Rate Limit Summary

| Limit | Scope | Window | ephemeralCache |
|---|---|---|---|
| 2 requests | Per IP | 12 hours sliding | Yes |
| 50 requests | Global | 1 minute fixed | Yes |
| 60 poll requests | Per IP | 1 minute fixed | Yes |

---

## Environment Variables

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
QSTASH_URL
QSTASH_TOKEN
QSTASH_CURRENT_SIGNING_KEY
QSTASH_NEXT_SIGNING_KEY
```

---

## What Does NOT Change

- Roast agent logic (`roastAgent()`) — unchanged.
- Metrics storage (`storeRoastMetrics`) — called from worker `onFinish`, same as before.
- Turnstile integration — same `verifyTurnstile` utility, same guard for new enqueue requests.
- Existing stream-store (`storeStream` / `resumeStream`) — used for chat replay, not touched.

---

## Error Handling

- **Worker crash mid-stream** — QStash will retry the callback (configurable). Worker should check `roast:{host}:status` on start; if already `streaming` or `done`, skip to avoid double-processing.
- **Client disconnects during stream** — SSE handler closes cleanly; chunks remain in Redis until TTL.
- **QStash delivery failure** — status stays `queued` indefinitely. Add a TTL on `roast:{host}:status` of 15 minutes as a safety net so stale queue entries don't block the host permanently.
