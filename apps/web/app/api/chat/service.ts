import { mistral } from "@ai-sdk/mistral"
import { roasiAgent } from "@roaster/ai/agents/roasi/agent"
import {
  setActiveStreamId,
  storeStream,
  writeChatTitle,
} from "@roaster/ai/tools/memory"
import type { SkillMetadata } from "@roaster/ai/tools/skills"
import type { UIMessage } from "ai"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  generateText,
} from "ai"

const model = mistral("mistral-small-latest")

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

        let title = firstUserText.slice(0, 60)
        try {
          const { text } = await generateText({
            model,
            prompt: `
You are generating concise chat topics for a conversation list.

The assistant has these capabilities/instructions:
"""
${instructions.slice(0, 800)}
"""

Based on the user's first message AND the assistant's actual capabilities, generate:
- a natural, searchable chat topic
- 3 to 7 words only
- title case
- specific and meaningful, reflecting what the assistant will actually do
- no quotes, emojis, periods, or prefixes
- avoid vague titles like "Help Needed" or "Question"

User message:
"""
${firstUserText.slice(0, 500)}
"""

Return only the chat topic.
            `.trim(),
          })
          console.log({ text })
          if (text.trim()) title = text.trim()
        } catch {
          // fallback to truncated first message
        }

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
