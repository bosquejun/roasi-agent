import { mistral } from "@ai-sdk/mistral"
import { getSitewardenTools } from "@roaster/ai/skills/sitewarden/tools/index"
import { memoryTool, readCoreMemory, writeChatTitle } from "@roaster/ai/tools/memory"
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
  skills: SkillMetadata[],
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
            if (part.type === "text") return (part as { type: "text"; text: string }).text
          }
          return ""
        })()

        let title = firstUserText.slice(0, 40)
        try {
          const { text } = await generateText({
            model,
            prompt: `Generate a short 3-6 word title for a chat that starts with this message: "${firstUserText.slice(0, 200)}". Reply with only the title, no quotes or punctuation.`,
          })
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

  return createUIMessageStreamResponse({ stream })
}
