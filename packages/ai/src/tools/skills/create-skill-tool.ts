import { createBashTool, experimental_createSkillTool } from "bash-tool"
import { Bash } from "just-bash"

type BashSkillToolProps = {
  workspaceDir: string
}

export async function createSkillTool({
  workspaceDir = process.cwd(),
}: BashSkillToolProps) {
  const sandbox = new Bash({
    cwd: workspaceDir,
    network: {
      dangerouslyAllowFullInternetAccess: true,
    },
  })

  const { files } = await experimental_createSkillTool({
    skillsDirectory: "../ai/src/skills",
  })

  // Discover skills and get files to upload
  const { tools } = await createBashTool({
    files,

    sandbox,
  })

  return tools
}
