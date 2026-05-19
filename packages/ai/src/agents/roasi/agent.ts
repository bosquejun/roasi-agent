import { mistral } from "@ai-sdk/mistral"
import { getSitewardenTools } from "@roaster/ai/skills/sitewarden/tools/index"
import { memoryTool } from "@roaster/ai/tools/memory"
import { coreMemoryInstructions } from "@roaster/ai/tools/memory/memory-tool"
import { getPlanningTools } from "@roaster/ai/tools/planning"
import { loadSkillTool } from "@roaster/ai/tools/skills"
import { isLoopFinished, ToolLoopAgent } from "ai"
import { createBashTool, experimental_createSkillTool } from "bash-tool"
import {
  Bash,
  InMemoryFs,
  MountableFs,
  OverlayFs,
  ReadWriteFs,
} from "just-bash"

export const defaultTools = {
  loadSkill: loadSkillTool,
  memory: memoryTool,
  ...getPlanningTools(),
  ...getSitewardenTools(),
}

export const roasiAgent = async () => {
  const fs = new MountableFs({ base: new InMemoryFs() })

  // Mount agent
  fs.mount(
    "/home/agent",
    new ReadWriteFs({
      root: "../../packages/ai/src/agents/roasi",
    })
  )

  fs.mount(
    "/home/skills",
    new OverlayFs({
      root: "../../packages/ai/src/skills",
      readOnly: true,
    })
  )

  const workspaceRoot =
    process.env.NODE_ENV === "production" ? "/tmp" : process.cwd()
  fs.mount(
    "/home/workspace",
    new ReadWriteFs({
      root: `${workspaceRoot}/.workspace`,
    })
  )

  const sandbox = new Bash({ fs, cwd: "/home/agent" })

  const agentMd = await sandbox.readFile("./prompts/AGENT.md")
  const personality = await sandbox.readFile("./prompts/PERSONALITY.md")

  const { files } = await experimental_createSkillTool({
    skillsDirectory: "../../packages/ai/src/skills",
  })

  // Discover skills and get files to upload
  const { tools: skillsTools } = await createBashTool({
    files,
    sandbox,
  })

  const tools = { ...defaultTools, ...skillsTools }

  const instructions = `
    ${personality}

    ${agentMd}
    `

  const agent = new ToolLoopAgent({
    model: mistral("mistral-large-latest"),
    tools,
    instructions,
    stopWhen: isLoopFinished(),
    prepareCall: async (settings) => {
      const instructionsWithMemory = await coreMemoryInstructions(
        settings.instructions
      )
      return { ...settings, instructions: instructionsWithMemory }
    },
  })

  return agent
}
