import { createBashTool, experimental_createSkillTool } from "bash-tool"
import { Bash, ReadWriteFs } from "just-bash"

type BashSkillToolProps = {
  workspaceDir: string
  skillsDirectory?: string
}

export async function createSkillTool({
  workspaceDir = process.cwd(),
  skillsDirectory = "../../packages/ai/src/skills",
}: BashSkillToolProps) {
  const fs = new ReadWriteFs({
    root: workspaceDir,
  })

  const sandbox = new Bash({
    fs,
  })

  const { files } = await experimental_createSkillTool({
    skillsDirectory,
  })

  // Discover skills and get files to upload
  const { tools } = await createBashTool({
    files,
    sandbox,
  })

  return tools
}
