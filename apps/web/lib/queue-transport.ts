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
        await new Promise((r) => setTimeout(r, 5000))

        if (options.abortSignal?.aborted) break

        const pollRes = await fetch(
          `/api/roast/status?host=${encodeURIComponent(this.host)}`,
          { signal: options.abortSignal }
        )

        if (pollRes.status === 429) {
          // Poll rate-limited — wait for next iteration instead of failing
          continue
        }

        if (!pollRes.ok) {
          this.onQueuePosition?.(null)
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
          status: "queued" | "error" | "idle" | "unknown"
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

        // Unexpected status (idle/unknown): abort gracefully
        this.onQueuePosition?.(null)
        throw new Error("Queue session expired. Please refresh and try again.")
      }

      this.onQueuePosition?.(null)
      throw new Error("Request cancelled")
    }

    throw new Error(await res.text())
  }
}
