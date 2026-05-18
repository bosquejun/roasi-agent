import { roastAgent } from "@roaster/ai/agents/roasi/roast.agent"
import { setActiveStreamId, storeStream } from "@roaster/ai/tools/memory"
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const { host } = (await req.json()) as Awaited<{
    host: string
  }>

  if (!host) return new Response("Missing host", { status: 400 })

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
