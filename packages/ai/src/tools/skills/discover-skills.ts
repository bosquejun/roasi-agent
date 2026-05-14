import type { Dirent } from "fs"
import { readdir, readFile } from "fs/promises"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import yaml from "yaml"

export interface SkillMetadata {
  name: string
  description: string
  path: string
}

const DEFAULT_SKILLS_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../skills"
)

export async function discoverSkills(
  directories: string[] = [DEFAULT_SKILLS_DIR]
): Promise<SkillMetadata[]> {
  const skills: SkillMetadata[] = []
  const seenNames = new Set<string>()

  for (const dir of directories) {
    let entries: Dirent<string>[] = []
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      continue // Skip directories that don't exist
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const skillDir = `${dir}/${entry.name}`
      const skillFile = `${skillDir}/SKILL.md`

      try {
        const content = await readFile(skillFile, "utf-8")
        const frontmatter = parseFrontmatter(content)

        // First skill with a given name wins (allows project overrides)
        if (seenNames.has(frontmatter.name)) continue
        seenNames.add(frontmatter.name)

        skills.push({
          name: frontmatter.name,
          description: frontmatter.description,
          path: skillDir,
        })
      } catch {}
    }
  }
  return skills
}

function parseFrontmatter(content: string) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match?.[1]) throw new Error("No frontmatter found")
  // Parse YAML using your preferred library
  return yaml.parse(match[1])
}
