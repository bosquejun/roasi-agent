# Turnstile Bot Protection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add invisible Cloudflare Turnstile bot protection to `/api/roast` (every call) and `/api/chat` (first message only), and disable `/api/chat` when `CHAT_ENABLED=false`.

**Architecture:** A shared `lib/turnstile.ts` utility verifies tokens against Cloudflare's siteverify API. The `@marsidev/react-turnstile` widget mounts invisibly in `RoastPage` and `ChatPanel`, fires automatically on mount, and passes the resulting token via request body. `RoastPage` waits for the token before triggering its single `sendMessage` call. `ChatPanel` includes the token on every request; the server validates it only when `history.length === 0`.

**Tech Stack:** `@marsidev/react-turnstile`, Cloudflare Turnstile siteverify API, Next.js App Router, `@ai-sdk/react` `useChat` with `DefaultChatTransport`

---

### Task 1: Install dependency and configure environment

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/.env`

- [ ] **Step 1: Add @marsidev/react-turnstile to package.json**

In `apps/web/package.json`, add to `"dependencies"`:
```json
"@marsidev/react-turnstile": "^0.5.0"
```

- [ ] **Step 2: Install the package**

Run from monorepo root (`/home/junbosque/roaster-ph`):
```bash
pnpm install
```
Expected: packages install without errors, `pnpm-lock.yaml` updated.

- [ ] **Step 3: Add env vars to apps/web/.env**

Append to `apps/web/.env`:
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000BB"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
```
Note: `1x00000000000000000000BB` is Cloudflare's official test key for invisible mode (always passes). `1x0000000000000000000000000000000AA` is the test secret (always passes siteverify). Replace both with real keys from the Cloudflare dashboard for production — configure the site key as "Invisible" widget type there.

- [ ] **Step 4: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore: add @marsidev/react-turnstile dependency"
```

---

### Task 2: Server-side Turnstile verification utility

**Files:**
- Create: `apps/web/lib/turnstile.ts`

- [ ] **Step 1: Create the utility**

Create `apps/web/lib/turnstile.ts`:
```typescript
export async function verifyTurnstile(token: string): Promise<void> {
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
      }),
    }
  )
  const data = (await res.json()) as {
    success: boolean
    "error-codes"?: string[]
  }
  if (!data.success) {
    throw new Error(
      `Turnstile verification failed: ${data["error-codes"]?.join(", ")}`
    )
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/turnstile.ts
git commit -m "feat: add server-side Turnstile verification utility"
```

---

### Task 3: Gate and protect /api/chat

**Files:**
- Modify: `apps/web/app/api/chat/route.ts`

- [ ] **Step 1: Replace route.ts content**

Replace the entire contents of `apps/web/app/api/chat/route.ts` with:

```typescript
import { appendConversation, readConversations } from "@roaster/ai/tools/memory"
import type { SkillMetadata } from "@roaster/ai/tools/skills"
import type { UIMessage } from "ai"
import type { NextRequest } from "next/server"
import { isChatEnabled } from "@/lib/features"
import { verifyTurnstile } from "@/lib/turnstile"
import { buildInstructions } from "./instructions"
import { createChatStream } from "./service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  if (!isChatEnabled()) {
    return new Response("Not Found", { status: 404 })
  }

  const skills: SkillMetadata[] = []
  const instructions = buildInstructions(skills)

  const { message, id, turnstileToken } = (await req.json()) as {
    message: UIMessage
    id: string
    turnstileToken?: string
  }

  const history = await readConversations(id)

  if (history.length === 0) {
    if (!turnstileToken) {
      return new Response("Missing verification token", { status: 403 })
    }
    try {
      await verifyTurnstile(turnstileToken)
    } catch {
      return new Response("Verification failed", { status: 403 })
    }
  }

  await appendConversation({
    role: message.role,
    parts: message.parts,
    timestamp: new Date().toISOString(),
    id,
  })

  const fullMessages = [...history, message]

  const stream = await createChatStream(
    fullMessages,
    skills,
    instructions,
    id,
    history.length === 0,
    async (parts) => {
      await appendConversation({
        role: "assistant",
        parts,
        timestamp: new Date().toISOString(),
        id,
      })
    }
  )

  return stream
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/api/chat/route.ts
git commit -m "feat: gate /api/chat on CHAT_ENABLED and verify Turnstile on first message"
```

---

### Task 4: Protect /api/roast

**Files:**
- Modify: `apps/web/app/api/roast/route.ts`

- [ ] **Step 1: Replace route.ts content**

Replace the entire contents of `apps/web/app/api/roast/route.ts` with:

```typescript
import { roastAgent } from "@roaster/ai/agents/roasi/roast.agent"
import { setActiveStreamId, storeStream } from "@roaster/ai/tools/memory"
import { createClient } from "@supabase/supabase-js"
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai"
import type { NextRequest } from "next/server"
import { verifyTurnstile } from "@/lib/turnstile"

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
  await supabase.from("scrape_cache").upsert(
    { cache_key: `${host}:roast-metrics`, data: metrics },
    { onConflict: "cache_key" }
  )
}

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const { host, turnstileToken } = (await req.json()) as {
    host: string
    turnstileToken?: string
  }

  if (!host) return new Response("Missing host", { status: 400 })

  if (!turnstileToken) {
    return new Response("Missing verification token", { status: 403 })
  }

  try {
    await verifyTurnstile(turnstileToken)
  } catch {
    return new Response("Verification failed", { status: 403 })
  }

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
          onError: (error) => {
            return error instanceof Error ? error.message : String(error)
          },
          generateMessageId: generateId,
          onFinish({ messages }) {
            for (const message of messages) {
              for (const part of message.parts) {
                if (
                  part.type.includes("roastMetricsTool") &&
                  (part as any).state === "output-available"
                ) {
                  const metrics = (part as any).output as RoastMetrics
                  storeRoastMetrics(host, metrics).catch(console.error)
                }
              }
            }
          },
        })
      )
    },
  })

  return createUIMessageStreamResponse({
    stream,
    consumeSseStream({ stream: sseStream }) {
      const streamId = generateId()
      setActiveStreamId(host, streamId).catch(console.error)
      const writer = storeStream(streamId, host)
      ;(async () => {
        const reader = sseStream.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            writer.write(value)
          }
        } catch (err) {
          console.error("[stream-store] read error:", err)
        } finally {
          writer.end()
        }
      })()
    },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/api/roast/route.ts
git commit -m "feat: verify Turnstile token in /api/roast"
```

---

### Task 5: Add Turnstile widget to RoastPage

**Files:**
- Modify: `apps/web/components/features/roast/roast-page.tsx`

The current code fires `sendMessage` immediately on mount via `useEffect`. We must delay it until the Turnstile token is ready. Replace the `triggered` ref + immediate-fire pattern with a token-gated pattern.

- [ ] **Step 1: Replace roast-page.tsx content**

Replace the entire contents of `apps/web/components/features/roast/roast-page.tsx` with:

```tsx
/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <explanation> */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client"

import { useChat } from "@ai-sdk/react"
import { Turnstile } from "@marsidev/react-turnstile"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@roaster/ui/components/ai-elements/message"
import { buttonVariants } from "@roaster/ui/components/button"
import { DefaultChatTransport } from "ai"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StreamingIndicator } from "@/components/features/chat/chat-panel/StreamingIndicator"
import { useRoastCompleteSignal } from "./roast-complete-context"

interface SiteMetadata {
  ogImage?: string
  favicon?: string
  title?: string
  description?: string
}

interface ScrapeSiteOutput {
  metadata?: SiteMetadata
}

interface RoastMetrics {
  cringeScore: number
  delusionIndex: number
  audacityLevel: number
  embarrassmentRadius: number
}

const METRIC_CONFIGS: {
  key: keyof RoastMetrics
  label: string
  bg: string
  shadow: string
  labelColor: string
  barColor: string
}[] = [
  {
    key: "cringeScore",
    label: "Cringe Score",
    bg: "bg-fire-red-soft",
    shadow: "shadow-neo-fire",
    labelColor: "text-fire-red",
    barColor: "bg-fire-red",
  },
  {
    key: "delusionIndex",
    label: "Delusion Index",
    bg: "bg-fire-org-soft",
    shadow: "shadow-neo-orange",
    labelColor: "text-fire-orange",
    barColor: "bg-fire-orange",
  },
  {
    key: "audacityLevel",
    label: "Audacity Level",
    bg: "bg-[#F5E6D3] dark:bg-[#1E1208]",
    shadow: "shadow-[4px_4px_0_#7B3F00] dark:shadow-[4px_4px_0_#C4955A]",
    labelColor: "text-[#7B3F00] dark:text-[#C4955A]",
    barColor: "bg-[#7B3F00] dark:bg-[#C4955A]",
  },
  {
    key: "embarrassmentRadius",
    label: "Embarrassment Radius",
    bg: "bg-fire-yel-soft",
    shadow: "shadow-neo-yellow",
    labelColor: "text-fire-yellow",
    barColor: "bg-fire-yellow",
  },
]

interface RoastPageProps {
  host: string
}

function extractRoastMetrics(
  parts: { type: string }[]
): RoastMetrics | undefined {
  for (const part of parts) {
    const p = part as {
      type: string
      toolName?: string
      state?: string
      output?: unknown
    }

    const isDynamic =
      p.type === "dynamic-tool" && p.toolName === "roastMetricsTool"
    const isStatic = p.type === "tool-roastMetricsTool"

    if (!isDynamic && !isStatic) continue
    if (p.state !== "output-available") continue

    return p.output as RoastMetrics
  }
}

function extractSiteMetadata(
  parts: { type: string }[]
): SiteMetadata | undefined {
  for (const part of parts) {
    const p = part as {
      type: string
      toolName?: string
      state?: string
      output?: unknown
    }

    const isDynamic =
      p.type === "dynamic-tool" && p.toolName === "scrapeSiteTool"
    const isStatic = p.type === "tool-scrapeSiteTool"

    if (!isDynamic && !isStatic) continue
    if (p.state !== "output-available") continue

    if (process.env.NODE_ENV === "development") {
      console.log("[roast] scrapeSiteTool output", p.output)
    }

    return (p.output as ScrapeSiteOutput)?.metadata
  }
}

export function RoastPage({ host }: RoastPageProps) {
  const triggered = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/roast",
      prepareSendMessagesRequest() {
        return { body: { host, turnstileToken } }
      },
    }),
  })

  useEffect(() => {
    if (!turnstileToken) return
    if (triggered.current) return
    triggered.current = true
    sendMessage({ text: host })
  }, [host, sendMessage, turnstileToken])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const allParts = useMemo(
    () => messages.flatMap((m) => m.parts as { type: string }[]),
    [messages]
  )

  const siteMeta = useMemo(() => extractSiteMetadata(allParts), [allParts])
  const roastMetrics = useMemo(() => extractRoastMetrics(allParts), [allParts])

  const isDone = status === "ready" || status === "error"
  const { setComplete } = useRoastCompleteSignal()
  useEffect(() => {
    if (isDone) setComplete()
  }, [isDone, setComplete])

  const [copied, setCopied] = useState(false)
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${host}`
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [shareUrl])

  const hasRoastText = useMemo(
    () =>
      messages.some(
        (m) => m.role === "assistant" && m.parts.some((p) => p.type === "text")
      ),
    [messages]
  )

  return (
    <div
      className="z-10 mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-12 pb-40"
      aria-busy={!isDone}
      aria-label={!isDone ? "Loading roast results" : undefined}
    >
      {/* Metadata Card */}
      <div className="flex flex-col gap-4 border-[3px] border-foreground bg-card p-6 shadow-neo-md">
        {siteMeta?.ogImage ? (
          // biome-ignore lint/performance/noImgElement: external URL, can't use next/image without domain config
          <img
            src={siteMeta.ogImage}
            alt={siteMeta.title ?? host}
            className="aspect-video w-full rounded-sm object-cover"
          />
        ) : (
          <div className="aspect-video w-full animate-pulse rounded-sm bg-smoke" />
        )}
        <div className="flex items-center gap-3">
          {siteMeta?.favicon ? (
            // biome-ignore lint/performance/noImgElement: external URL
            <img
              src={siteMeta.favicon}
              alt=""
              className="size-8 shrink-0 rounded-full object-contain"
            />
          ) : (
            <div className="size-8 shrink-0 animate-pulse rounded-full bg-smoke" />
          )}
          <div className="flex flex-1 flex-col gap-1">
            {siteMeta?.title ? (
              <p className="font-mono font-semibold text-sm">
                {siteMeta.title}
              </p>
            ) : (
              <div className="h-4 w-32 animate-pulse rounded-sm bg-smoke" />
            )}
            <p className="font-mono text-stone text-xs">{host}</p>
          </div>
        </div>
        {siteMeta?.description ? (
          <p className="font-mono text-slate text-sm leading-relaxed">
            {siteMeta.description}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="h-3 w-full animate-pulse rounded-sm bg-smoke" />
            <div className="h-3 w-4/5 animate-pulse rounded-sm bg-smoke" />
          </div>
        )}
      </div>

      {/* Roast Content */}
      <div className="flex flex-col gap-4">
        {messages.map((message, messageIndex) => {
          if (message.role !== "assistant") return null
          const textParts = message.parts.filter((p) => p.type === "text") as {
            type: "text"
            text: string
          }[]
          return textParts
            .filter((part) => part.text.trim() && part.text.trim() !== "{}")
            .map((part, i) => (
              <Message key={`${messageIndex}-${i}`} from="assistant">
                <MessageContent>
                  <MessageResponse className="font-medium text-md [&_em]:font-semibold [&_em]:text-fire-orange [&_em]:not-italic [&_strong]:font-bold [&_strong]:text-fire-red">
                    {part.text}
                  </MessageResponse>
                </MessageContent>
              </Message>
            ))
        })}
        <StreamingIndicator status={status} messages={messages} />
      </div>

      {/* Metrics */}
      {isDone && hasRoastText && (
        <div className="grid grid-cols-2 gap-4">
          {METRIC_CONFIGS.map(
            ({ key, label, bg, shadow, labelColor, barColor }, index) => {
              const score = roastMetrics?.[key]
              return (
                <div
                  key={key}
                  className={`fade-in slide-in-from-bottom-4 flex animate-in flex-col gap-3 border-[3px] border-foreground fill-mode-both p-5 duration-500 ${bg} ${shadow}`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <p
                    className={`font-mono text-[10px] uppercase tracking-widest`}
                  >
                    {label}
                  </p>
                  {score !== undefined ? (
                    <>
                      <p className="font-pixel text-5xl text-foreground leading-none">
                        {score}
                      </p>
                      <div className="mt-auto flex flex-col gap-1.5">
                        <div className="h-2 w-full border border-foreground bg-foreground/10">
                          <div
                            className={`h-full ${barColor} transition-all duration-700`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <p
                          className={`text-right font-mono text-[10px] ${labelColor}`}
                        >
                          / 100
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-12 w-16 animate-pulse rounded-sm bg-foreground/10" />
                      <div className="mt-auto flex flex-col gap-1.5">
                        <div className="h-2 w-full animate-pulse rounded-sm bg-foreground/10" />
                      </div>
                    </>
                  )}
                </div>
              )
            }
          )}
        </div>
      )}

      {/* Share CTA */}
      {isDone && hasRoastText && (
        <div
          className="fade-in slide-in-from-bottom-4 flex animate-in flex-col gap-4 border-[3px] border-fire-red bg-fire-red-soft fill-mode-both p-6 shadow-neo-fire duration-500"
          style={{ animationDelay: "480ms" }}
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-pixel text-fire-red text-lg uppercase">
              Brave enough to share this?
            </h3>
            <p className="font-mono text-foreground/70 text-sm">
              Most founders aren&apos;t.{" "}
              <span className="font-semibold text-fire-red">
                Prove us wrong.
              </span>
            </p>
          </div>
          {/* OG image preview */}
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block border-[3px] border-fire-red transition-opacity hover:opacity-90"
          >
            {/* biome-ignore lint/performance/noImgElement: dynamic OG route, can't use next/image */}
            <img
              src={`/r/${host}/opengraph-image`}
              alt={`Roast card for ${host}`}
              className="aspect-[1200/630] w-full object-cover"
            />
          </a>
          <div className="flex gap-3">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`just got roasted 🔥\n\ncheck the verdict on ${host}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "dark", size: "md" })}
            >
              Share on X
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className={buttonVariants({ variant: "ghost", size: "md" })}
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      )}

      {/* Chat CTA */}
      {hasRoastText && isDone && (
        <div
          className="fade-in slide-in-from-bottom-4 flex animate-in flex-col items-center gap-4 border-[3px] border-foreground bg-card fill-mode-both p-6 text-center shadow-neo-md duration-500"
          style={{ animationDelay: "640ms" }}
        >
          <h3 className="font-pixel text-base uppercase">Still in denial?</h3>
          <p className="font-mono text-slate text-sm">
            Ask Roasi for a real fix plan. No sugarcoating.
          </p>
          <Link
            href="/chat"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            Chat with Roasi
          </Link>
        </div>
      )}

      <div ref={bottomRef} />

      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        options={{ appearance: "interaction-only" }}
        onSuccess={setTurnstileToken}
        className="hidden"
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/features/roast/roast-page.tsx
git commit -m "feat: add invisible Turnstile widget to RoastPage, gate sendMessage on token"
```

---

### Task 6: Add Turnstile widget to ChatPanel

**Files:**
- Modify: `apps/web/components/features/chat/chat-panel/ChatPanel.tsx`

The token is stored in a ref (not state) to avoid re-renders. It's included in every request body; the server only validates it on first message.

- [ ] **Step 1: Add Turnstile import**

At the top of `apps/web/components/features/chat/chat-panel/ChatPanel.tsx`, add after the existing imports:
```typescript
import { Turnstile } from "@marsidev/react-turnstile"
```

- [ ] **Step 2: Add token ref inside ChatPanel function**

After the existing `const isNewChatRef = useRef(false)` line (line 54), add:
```typescript
const turnstileTokenRef = useRef<string | null>(null)
```

- [ ] **Step 3: Update prepareSendMessagesRequest to include token**

Replace the existing `prepareSendMessagesRequest` callback (lines 58-60):
```typescript
// before
prepareSendMessagesRequest({ messages, id }) {
  return { body: { message: messages[messages.length - 1], id } }
},
```
With:
```typescript
// after
prepareSendMessagesRequest({ messages, id }) {
  return {
    body: {
      message: messages[messages.length - 1],
      id,
      turnstileToken: turnstileTokenRef.current,
    },
  }
},
```

- [ ] **Step 4: Add Turnstile widget to empty-state return**

In the first return branch (the `empty || messages.length === 0` branch), add the `<Turnstile>` widget just before the closing `</div>` of the root element:
```tsx
<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
  options={{ appearance: "interaction-only" }}
  onSuccess={(token) => {
    turnstileTokenRef.current = token
  }}
  className="hidden"
/>
```

- [ ] **Step 5: Add Turnstile widget to conversation return**

In the second return branch (the conversation state), add the same `<Turnstile>` widget just before the closing `</div>` of the root element:
```tsx
<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
  options={{ appearance: "interaction-only" }}
  onSuccess={(token) => {
    turnstileTokenRef.current = token
  }}
  className="hidden"
/>
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/features/chat/chat-panel/ChatPanel.tsx
git commit -m "feat: add invisible Turnstile widget to ChatPanel"
```
