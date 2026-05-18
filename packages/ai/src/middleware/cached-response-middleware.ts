import { supabase } from "../lib/supabase"
import { type LanguageModelMiddleware, simulateReadableStream } from "ai"
import objectHash from "object-hash"

export const cachedResponseMiddleware: LanguageModelMiddleware = {
  specificationVersion: "v3",
  wrapStream: async ({ doStream, params }) => {
    const cacheKey = objectHash(params)

    const { data: cached } = await supabase
      .from("ai_response_cache")
      .select("data")
      .eq("cache_key", cacheKey)
      .single()

    if (cached) {
      const formattedChunks = (cached.data as any[]).map((p) => {
        if (p.type === "response-metadata" && p.timestamp) {
          return { ...p, timestamp: new Date(p.timestamp) }
        } else return p
      })
      return {
        stream: simulateReadableStream({
          initialDelayInMs: 0,
          chunkDelayInMs: 20,
          chunks: formattedChunks,
        }),
      }
    }

    const { stream, ...rest } = await doStream()

    const fullResponse: any[] = []

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        fullResponse.push(chunk)
        controller.enqueue(chunk)
      },
      flush() {
        supabase
          .from("ai_response_cache")
          .upsert({ cache_key: cacheKey, data: fullResponse })
          .then(({ error }) => {
            if (error) console.error("[ai_response_cache] upsert failed:", error.message)
          })
      },
    })

    return {
      stream: stream.pipeThrough(transformStream),
      ...rest,
    }
  },
}
