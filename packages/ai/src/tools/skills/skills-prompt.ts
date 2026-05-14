import type { SkillMetadata } from "./discover-skills.js"

export function buildSkillsPrompt(skills: SkillMetadata[]): string {
  const skillsList = skills
    .map((s) => `- ${s.name}: ${s.description}`)
    .join("\n")

  return `
## Skills

Use the \`loadSkill\` tool to load a skill when the user's request
would benefit from specialized instructions.

Available skills:
${skillsList}
`
}
