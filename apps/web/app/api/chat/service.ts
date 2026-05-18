import { roasiAgent } from "@roaster/ai/agents/roasi/agent"
import {
  setActiveStreamId,
  storeStream,
  writeChatTitle,
} from "@roaster/ai/tools/memory"
import type { SkillMetadata } from "@roaster/ai/tools/skills"
import { generateChatTopic } from "@roaster/ai/utils/generateChatTopic"
import type { UIMessage } from "ai"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai"

export async function createChatStream(
  messages: UIMessage[],
  _skills: SkillMetadata[],
  instructions: string,
  chatId: string,
  isNewChat: boolean,
  onFinish?: (parts: UIMessage["parts"]) => Promise<void>
) {
  const modelMessages = await convertToModelMessages(messages)

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      if (isNewChat) {
        const firstUser = messages.find((m) => m.role === "user")
        const firstUserText = (() => {
          if (!firstUser) return ""
          for (const part of firstUser.parts) {
            if (part.type === "text")
              return (part as { type: "text"; text: string }).text
          }
          return ""
        })()

        const title = await generateChatTopic(firstUserText, instructions)

        writer.write({ type: "start", messageMetadata: { title } })
        await writeChatTitle(chatId, title)
      }

      const agent = await roasiAgent()

      const result = await agent.stream({
        messages: modelMessages,
      })

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          sendSources: true,
          onError: (error) => {
            return error instanceof Error ? error.message : String(error)
          },
          originalMessages: messages,
          generateMessageId: generateId,
          onFinish: ({ messages: updatedMessages }) => {
            if (!onFinish) return
            const last = updatedMessages[updatedMessages.length - 1]
            if (!last) return
            onFinish(last.parts).catch((err) =>
              console.error("[agent] onFinish error:", err)
            )
          },
        })
      )
    },
  })

  return createUIMessageStreamResponse({
    stream,
    consumeSseStream({ stream: sseStream }) {
      const streamId = generateId()
      setActiveStreamId(chatId, streamId).catch(console.error)
      const writer = storeStream(streamId, chatId)
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
