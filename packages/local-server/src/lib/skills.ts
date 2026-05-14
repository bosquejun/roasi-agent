import { discoverSkills } from "@roaster/ai"
import { buildSkillsPrompt } from "@roaster/ai/skills/skills-prompt"
import type { SkillMetadata } from "@roaster/ai/skills/discover-skills"

export async function loadSkills(): Promise<SkillMetadata[]> {
  const skills = await discoverSkills()
  return skills
}

export function buildInstructions(skills: SkillMetadata[]): string {
  return `
You are Roaster, a website quality analyst.

When a user asks to analyze, roast, audit, or get feedback on a website:
1. Call scanSite with the URL — wait for the outputPath
2. Call analyzeResults with that outputPath — get the structured report
3. Reason over the report and deliver findings in your persona

If scanSite returns an error, explain the issue to the user with the exact error message and suggest the fix.

${buildSkillsPrompt(skills)}
`.trim()
}