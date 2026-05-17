import { readFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

export const personalityInstructions = readFileSync(
  join(__dirname, "personality.md"),
  "utf-8"
).trim()

export const agentInstructions = readFileSync(
  join(__dirname, "agent.md"),
  "utf-8"
).trim()
