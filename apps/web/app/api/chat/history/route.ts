import { readConversations } from "@roaster/ai/tools/memory"
import type { SkillMetadata } from "@roaster/ai/tools/skills"
import type { UIMessage } from "ai"
import { generateId } from "ai"
import { NextResponse } from "next/server"

export async function GET() {
  const _skills: SkillMetadata[] = []
  const history = await readConversations()
  const messages: UIMessage[] = history.map((entry) => ({
    id: generateId(),
    role: entry.role,
    parts: entry.parts as UIMessage["parts"],
  }))
  return NextResponse.json({ messages })
}
