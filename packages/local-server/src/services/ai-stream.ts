import { mistral } from "@ai-sdk/mistral"
import { getSitewardenTools } from "@roaster/ai/skills/sitewarden/tools/index"
import { memoryTool, readCoreMemory } from "@roaster/ai/tools/memory"
import { getPlanningTools } from "@roaster/ai/tools/planning"
import type { SkillMetadata } from "@roaster/ai/tools/skills"
import { createSkillTool, loadSkillTool } from "@roaster/ai/tools/skills"
import type { UIMessage } from "ai"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
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

export async function processChatStream(
  messages: UIMessage[],
  skills: SkillMetadata[],
  instructions: string,
  onFinish?: (parts: UIMessage["parts"]) => Promise<void>
) {
  const modelMessages = await convertToModelMessages(messages)

  const bashTools = await createSkillTool({ workspaceDir: process.cwd() })

  const tools = { ...defaultTools, ...bashTools }

  const today = new Date().toISOString().slice(0, 10)

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
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
        onStepFinish({ toolCalls, toolResults, text, finishReason, usage }) {
          console.log(
            `[agent] step finish —  finishReason=${finishReason} tokens=${usage?.totalTokens ?? "?"}`
          )
          if (toolCalls?.length) {
            for (const call of toolCalls) {
              console.log(
                `[agent] tool call — ${call.toolName}`,
                JSON.stringify(call.input)
              )
            }
          }
          if (toolResults?.length) {
            for (const result of toolResults) {
              const preview = JSON.stringify(result.output).slice(0, 200)
              console.log(
                `[agent] tool result — ${result.toolName}: ${preview}`
              )
            }
          }
          if (text) {
            console.log(`[agent] text — ${text.slice(0, 200)}`)
          }
        },
      })

      console.log(
        `[agent] starting stream — skills=${skills.map((s) => s.name).join(", ")} messages=${modelMessages.length}`
      )
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
            if (last?.role !== "assistant") return
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
