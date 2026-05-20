# Roast Queue & Rate Limit Design

**Date:** 2026-05-20
**Status:** Approved

## Problem

`POST /api/roast` calls two third-party APIs sequentially — Firecrawl (scraping) and Mistral (LLM inference). Under traffic spikes, both providers return 429 rate limit errors. The current architecture streams responses synchronously with no queue, so rate limit errors surface directly to users as failures.

## Goal

Serialize roast jobs through a durable queue so that:
1. Third-party rate limits are never hit (one roast at a time)
2. Users see their queue position while waiting, not an error
3. QStash handles provider 429s via automatic retry with backoff

## Non-Goals

- Parallel/concurrent processing (one at a time is the target)
- Async "come back later" UX (users stay on the page)
- Replacing any existing infrastructure — QStash, Redis, Supabase all stay

## Architecture Overview

```
[Browser]
    ↓ POST /api/roast { host }
[Validate → Turnstile → Rate limit → Cache check]
    ↓ cache hit: stream immediately (no change)
    ↓ cache miss: enqueue + 202 { host, position }
[Client polls GET /api/roast/status?host=]
    ↓ { status: "queued", position: N }
[QueueStatus UI: "Nth in line"]
    ↓ (status flips to "streaming")
[Client switches to SSE relay from status endpoint]
    ↓
[QStash delivers POST /api/roast/worker (serialized)]
[Worker: dequeue → Firecrawl → Mistral → Redis chunks → done]
    ↓ on 429: return non-2xx → QStash retries with backoff
    ↓ on success: persist metrics to Supabase, set status "done"
```

## What's Already Built

The queue infrastructure exists but is disconnected from the main flow.

| Component | File | State |
|---|---|---|
| Redis queue (`roast:queue`) | `app/api/roast/worker/route.ts` | Built, unused |
| QStash worker endpoint | `app/api/roast/worker/route.ts` | Built, unused |
| Status polling endpoint | `app/api/roast/status/route.ts` | Built, unused |
| `QueueStatus` UI component | `components/features/roast/queue-status.tsx` | Built, not rendered |
| QStash + Redis clients | `lib/upstash.ts` | Configured |

## What Changes

### 1. `POST /api/roast` — Stop streaming, start enqueuing

**Current:** validates → streams agent response directly  
**New:** validates → cache check → if miss, enqueue + trigger QStash + return `202`

Redis operations:
- `RPUSH roast:queue <host>` — add to end of queue
- `SET roast:<host>:status "queued" EX 600` — mark as queued, 10min TTL

Response: `202 { host, position }` (no SSE stream for uncached roasts)

Cache-hit path unchanged: if Supabase has metrics for host, stream immediately.

### 2. `POST /api/roast/worker` — Add retry signaling on provider errors

**Current:** catches all errors and sets status to `"error"`  
**New:** on Mistral or Firecrawl 429 responses, return `HTTP 500` (or `429`) to QStash so it retries

QStash retry behavior: exponential backoff, configurable max retries (set via QStash publish options or dashboard).

Also add `LREM roast:queue 1 <host>` at job start to dequeue atomically before processing.

### 3. `QueueAwareChatTransport` — Handle 202 and switch to polling

**Current:** sends POST, handles 429 errors, otherwise reads SSE stream  
**New:**
- On `202` response: extract `position`, emit queue state, begin polling `/api/roast/status`
- On poll `status === "streaming"`: switch to SSE relay (status endpoint already relays chunks)
- On poll `status === "done"` or `"error"`: finalize

### 4. `roast-page.tsx` — Render QueueStatus

**Current:** `QueueStatus` imported but not rendered  
**New:** render `QueueStatus` when transport is in queued state, hide when streaming begins

## Data Contracts

**`POST /api/roast` response (cache miss):**
```json
{ "host": "example.com", "position": 3 }
// HTTP 202
```

**`GET /api/roast/status?host=example.com` responses:**
```json
// Queued
{ "status": "queued", "position": 2 }

// Streaming (SSE relay begins)
// ... SSE chunks ...

// Done
{ "status": "done" }

// Error
{ "status": "error", "message": "..." }
```

## Redis Key Schema

| Key | Type | TTL | Purpose |
|---|---|---|---|
| `roast:queue` | List | — | FIFO queue of hosts |
| `roast:<host>:status` | String | 10min | `queued` / `streaming` / `done` / `error` |
| `roast:<host>:chunks` | List | 10min | SSE chunks for relay |

## Error Handling

| Error | Behavior |
|---|---|
| Mistral 429 | Worker returns non-2xx → QStash retries with backoff |
| Firecrawl 429 | Same |
| Worker crash | QStash retries (at-least-once delivery) |
| Max retries exceeded | QStash marks failed; worker sets status `"error"` on final attempt |
| Status TTL expired | Client gets `"idle"` from status endpoint; show generic error |

## Out of Scope

- Queue position estimates (ETA display)
- Priority queue / VIP lanes
- Per-user queue limits beyond existing IP rate limits
- Replacing QStash with Vercel Queues (viable future migration)
