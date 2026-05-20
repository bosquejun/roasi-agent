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

    // Fix 3: use !== undefined so position 0 is not falsy-skipped
    if (enqueueData.status === "queued" && enqueueData.position !== undefined) {
      onQueueUpdate(enqueueData.position)
    }

    // Step 2: Poll until streaming starts
    while (true) {
      // Fix 2: abort-aware sleep — rejects immediately on abort
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 2000)
        options.abortSignal?.addEventListener(
          "abort",
          () => {
            clearTimeout(timer)
            reject(new DOMException("Aborted", "AbortError"))
          },
          { once: true }
        )
      })

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
        // Fix 1: call protected method directly on this (subclass has access)
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

  // Fix 4: retry once after a brief delay if the first response is not SSE
  private async connectToStatus(
    host: string,
    signal: AbortSignal | undefined
  ): ReturnType<InstanceType<typeof DefaultChatTransport<UIMessage>>["sendMessages"]> {
    const res = await fetch(`/api/roast/status?host=${encodeURIComponent(host)}`, {
      signal,
    })
    if (res.ok && res.headers.get("content-type")?.includes("text/event-stream")) {
      // Fix 1: call protected method without (this as any) cast
      return this.processResponseStream(res.body!)
    }
    // If done (roast finished very quickly), fall back to polling loop
    // by retrying after a brief delay
    await new Promise<void>((r) => setTimeout(r, 500))
    const retryRes = await fetch(`/api/roast/status?host=${encodeURIComponent(host)}`, { signal })
    if (retryRes.ok && retryRes.headers.get("content-type")?.includes("text/event-stream")) {
      return this.processResponseStream(retryRes.body!)
    }
    throw new Error("Roast is not streaming")
  }
}
