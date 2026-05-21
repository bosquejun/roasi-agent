import { createUIMessageStreamResponse } from "ai"
import type { NextRequest } from "next/server"
import { start } from "workflow/api"
import { checkRatelimit } from "@/lib/ratelimit"
import { hasBeenRoasted } from "@/lib/supabase"
import { isTurnstileEnabled, verifyTurnstile } from "@/lib/turnstile"
import { resolveUrl } from "@/lib/url"
import { startRoastWorkflow } from "@/lib/workflow/roast.workflow"

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

  let resolvedHost: string
  try {
    const resolved = await resolveUrl(host)
    resolvedHost = resolved.host
  } catch {
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

  const cached = await hasBeenRoasted(resolvedHost)

  let clientIp: string | undefined
  let rlHeaders: Record<string, string> | undefined

  if (!cached) {
    const rl = await checkRatelimit(req, resolvedHost)
    if (rl.blocked) return rl.response
    clientIp = rl.ip
    rlHeaders = rl.headers
  }

  const run = await start(startRoastWorkflow, [
    { host: resolvedHost, clientIp: clientIp as string },
  ])

  return createUIMessageStreamResponse({
    stream: run.readable,
    headers: rlHeaders,
  })
}
