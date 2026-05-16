import {
  agentInstructions,
  discoverSkills,
  personalityInstructions,
  type SkillMetadata,
} from "@roaster/ai"

export async function loadSkills(): Promise<SkillMetadata[]> {
  return discoverSkills()
}

export function buildInstructions(_skills: SkillMetadata[]): string {
  return `${personalityInstructions}

---

${agentInstructions}`.trim()
}
