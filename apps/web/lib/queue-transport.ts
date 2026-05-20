import { DefaultChatTransport, UIMessage } from "ai"

interface QueueAwareChatTransportOptions {
  host: string
  getTurnstileToken: () => string | null
  onQueueUpdate: (position: number | null) => void
}

export class QueueAwareChatTransport extends DefaultChatTransport<UIMessage> {
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
    options: Parameters<InstanceType<typeof DefaultChatTransport<UIMessage>>["sendMessages"]>[0]
  ): ReturnType<InstanceType<typeof DefaultChatTransport<UIMessage>>["sendMessages"]> {
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
        return (this as any).processResponseStream(statusRes.body!)
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
  ): ReturnType<InstanceType<typeof DefaultChatTransport<UIMessage>>["sendMessages"]> {
    return fetch(`/api/roast/status?host=${encodeURIComponent(host)}`, {
      signal,
    }).then((res) => {
      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        return (this as any).processResponseStream(res.body!)
      }
      throw new Error("Roast not currently streaming")
    })
  }
}
