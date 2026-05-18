import { mistral } from "@ai-sdk/mistral"
import { getSitewardenTools } from "@roaster/ai/skills/sitewarden/tools/index"
import {
  memoryTool,
  readCoreMemory,
  setActiveStreamId,
  storeStream,
  writeChatTitle,
} from "@roaster/ai/tools/memory"
import { getPlanningTools } from "@roaster/ai/tools/planning"
import type { SkillMetadata } from "@roaster/ai/tools/skills"
import { createSkillTool, loadSkillTool } from "@roaster/ai/tools/skills"
import type { UIMessage } from "ai"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  generateText,
  isLoopFinished,
  ToolLoopAgent,
} from "ai"

const model = mistral("mistral-small-latest")

export const defaultTools = {
  loadSkill: loadSkillTool,
  memory: memoryTool,
  ...getPlanningTools(),
  ...getSitewardenTools(),
}

export async function createChatStream(
  messages: UIMessage[],
  _skills: SkillMetadata[],
  instructions: string,
  chatId: string,
  isNewChat: boolean,
  onFinish?: (parts: UIMessage["parts"]) => Promise<void>
) {
  const modelMessages = await convertToModelMessages(messages)

  const bashTools = await createSkillTool({ workspaceDir: process.cwd() })

  const tools = { ...defaultTools, ...bashTools }

  const today = new Date().toISOString().slice(0, 10)

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

      const agent = new ToolLoopAgent({
        model,
        tools,
        instructions,
        stopWhen: isLoopFinished(),
        prepareCall: async (settings) => {
          const coreMemory = await readCoreMemory()
          return {
            ...settings,
            instructions: `${settings.instructions}

Today's date is ${today}.

Core memory:
${coreMemory}

You can save and recall important information using the memory tool.`,
          }
        },
      })

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
