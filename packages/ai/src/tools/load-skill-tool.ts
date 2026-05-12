import { tool } from "ai"
import { readFile } from "fs/promises"
import { z } from "zod"
import type { SkillMetadata } from "../skills/discover-skills.js"

function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/)
  return match ? content.slice(match[0].length).trim() : content.trim()
}

export const loadSkillTool = tool({
  description: "Load a skill to get specialized instructions",
  inputSchema: z.object({
    name: z.string().describe("The skill name to load"),
  }),
  execute: async ({ name }, { experimental_context }) => {
    const { skills } = experimental_context as {
      skills: SkillMetadata[]
    }

    const skill = skills.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    )
    if (!skill) {
      return { error: `Skill '${name}' not found` }
    }

    const skillFile = `${skill.path}/SKILL.md`
    const content = await readFile(skillFile, "utf-8")
    const body = stripFrontmatter(content)

    return {
      skillDirectory: skill.path,
      content: body,
    }
  },
})
