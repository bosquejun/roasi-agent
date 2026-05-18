import { mistral } from "@ai-sdk/mistral"
import { scrapeSiteTool } from "@roaster/ai/tools/roast-site"
import { isLoopFinished, ToolLoopAgent } from "ai"
import { Bash, InMemoryFs, MountableFs, ReadWriteFs } from "just-bash"

export const roastAgent = async () => {
  const fs = new MountableFs({ base: new InMemoryFs() })

  // Mount agent
  fs.mount(
    "/home/agent",
    new ReadWriteFs({
      root: "../../packages/ai/src/agents/roasi",
    })
  )

  fs.mount(
    "/home/workspace",
    new ReadWriteFs({
      root: "./.workspace",
    })
  )

  const sandbox = new Bash({ fs, cwd: "/home/agent" })

  const roastMd = await sandbox.readFile("./prompts/ROAST.md")

  const tools = { scrapeSiteTool }

  const instructions = `
    ${roastMd}
    `

  const agent = new ToolLoopAgent({
    model: mistral("mistral-small-latest"),
    tools,
    instructions,
    stopWhen: isLoopFinished(),
  })

  return agent
}
