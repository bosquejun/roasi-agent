import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { isTurnstileEnabled, verifyTurnstile } from "@/lib/turnstile"
import { globalRatelimit, ipRatelimit } from "@/lib/upstash"
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

  // Already roasted — model cache will serve it, no new inference cost.
  const cached = await hasRoastMetrics(host)

  if (!cached) {
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
