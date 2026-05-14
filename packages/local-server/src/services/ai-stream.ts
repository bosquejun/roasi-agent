import { mistral } from "@ai-sdk/mistral"
import type { SkillMetadata } from "@roaster/ai/skills/discover-skills"
import { buildSkillsPrompt } from "@roaster/ai/skills/skills-prompt"
import {
  bashTool,
  callOptionsSchema,
  createSandbox,
  readFileTool,
} from "@roaster/ai/tools/basic-tools"
import { loadSkillTool } from "@roaster/ai/tools/load-skill-tool"
import { analyzeResultsTool, scanSiteTool } from "@roaster/ai/tools/site-audit"
import type { UIMessage } from "ai"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  stepCountIs,
  ToolLoopAgent,
} from "ai"

const model = mistral("mistral-large-2512")

export const tools = {
  loadSkill: loadSkillTool,
  readFile: readFileTool,
  bash: bashTool,
  scanSite: scanSiteTool,
  analyzeResults: analyzeResultsTool,
}

export async function processChatStream(
  messages: UIMessage[],
  skills: SkillMetadata[],
  instructions: string
) {
  const modelMessages = await convertToModelMessages(messages)
  const sandbox = createSandbox({ workingDirectory: process.cwd() })

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const agent = new ToolLoopAgent({
        model,
        tools,
        callOptionsSchema,
        instructions,
        stopWhen: stepCountIs(5),
        prepareCall: ({ options, ...settings }) => ({
          ...settings,
          instructions: `${settings.instructions}\n\n${buildSkillsPrompt(options.skills)}`,
          experimental_context: {
            sandbox: options.sandbox,
            skills: options.skills,
          },
        }),
        onStepFinish({ usage }) {
          console.log({ usage })
        },
      })

      const result = await agent.stream({
        messages: modelMessages,
        options: {
          sandbox,
          skills,
        },
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
