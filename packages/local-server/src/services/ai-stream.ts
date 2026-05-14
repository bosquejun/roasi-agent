import { mistral } from "@ai-sdk/mistral"
import { getSitewardenTools } from "@roaster/ai/skills/sitewarden/tools/index"
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
  ...getPlanningTools(),
  ...getSitewardenTools(),
}

export async function processChatStream(
  messages: UIMessage[],
  skills: SkillMetadata[],
  instructions: string
) {
  const modelMessages = await convertToModelMessages(messages)
  // const sandbox = createSandbox({ workingDirectory: process.cwd() })

  const bashTools = await createSkillTool({ workspaceDir: process.cwd() })

  const tools = { ...defaultTools, ...bashTools }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const agent = new ToolLoopAgent({
        model,
        tools,
        instructions,
        stopWhen: isLoopFinished(),
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
        })
      )
    },
  })

  return createUIMessageStreamResponse({ stream })
}
