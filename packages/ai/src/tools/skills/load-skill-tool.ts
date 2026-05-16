import { tool } from "ai"
import { readFile } from "fs/promises"
import { z } from "zod"
import type { SkillMetadata } from "./discover-skills"

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
    console.log(`[loadSkill] requested skill='${name}'`)
    const { skills } = experimental_context as {
      skills: SkillMetadata[]
    }

    const skill = skills.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    )
    if (!skill) {
      console.log(
        `[loadSkill] skill '${name}' not found. Available: ${skills.map((s) => s.name).join(", ")}`
      )
      return { error: `Skill '${name}' not found` }
    }

    console.log(`[loadSkill] loading skill='${name}' path=${skill.path}`)
    const skillFile = `${skill.path}/SKILL.md`
    const content = await readFile(skillFile, "utf-8")
    const body = stripFrontmatter(content)
    console.log(
      `[loadSkill] loaded skill='${name}' contentLength=${body.length}`
    )

    return {
      skillDirectory: skill.path,
      content: body,
    }
  },
})
