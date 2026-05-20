import { DefaultChatTransport, UIMessage } from "ai"

interface RoastChatTransportOptions {
  host: string
  getTurnstileToken: () => string | null
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
      const data = await res.json() as { error: "ip" | "global"; reset: number }
      throw new RateLimitError({ kind: data.error, reset: data.reset })
    }

    if (!res.ok) throw new Error(await res.text())
    if (!res.body) throw new Error("Empty response body")

    return this.processResponseStream(res.body)
  }
}
