import { DefaultChatTransport, UIMessage } from "ai"

interface RoastChatTransportOptions {
  host: string
  getTurnstileToken: () => string | null
}

export class RateLimitError extends Error {
  readonly reset: number
  readonly kind: "ip" | "host" | "global"

  constructor({ kind, reset }: { kind: "ip" | "host" | "global"; reset: number }) {
    super("rate_limit")
    this.name = "RateLimitError"
    this.reset = reset
    this.kind = kind
  }
}

export class RoastChatTransport extends DefaultChatTransport<UIMessage> {
  private readonly host: string
  private readonly getTurnstileToken: () => string | null

  constructor({ host, getTurnstileToken }: RoastChatTransportOptions) {
    super()
    this.host = host
    this.getTurnstileToken = getTurnstileToken
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
      const policy = res.headers.get("X-RateLimit-Policy") as "ip" | "host" | "global" | null
      const resetSec = Number(res.headers.get("X-RateLimit-Reset") ?? "0")
      throw new RateLimitError({
        kind: policy ?? "global",
        reset: resetSec * 1000,
      })
    }

    if (res.ok) {
      if (!res.body) throw new Error("Empty response body")
      return this.processResponseStream(res.body)
    }

    throw new Error(await res.text())
  }
}
