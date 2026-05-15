import { appendConversation, readConversations } from "@roaster/ai/tools/memory"
import type { SkillMetadata } from "@roaster/ai/tools/skills"
import type { UIMessage } from "ai"
import { generateId } from "ai"
import { NextRequest } from "next/server"
import { buildInstructions } from "./instructions"
import { createChatStream } from "./service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const skills: SkillMetadata[] = []
  const instructions = buildInstructions(skills)

  const body = await req.json<{
    message?: UIMessage
    messages?: UIMessage[]
  }>()
  const userMsg = body.message ?? body.messages?.[body.messages.length - 1]

  const history = await readConversations()
  const historyMessages: UIMessage[] = history.slice(-20).map((entry) => ({
    id: generateId(),
    role: entry.role,
    parts: entry.parts as UIMessage["parts"],
  }))

  const fullMessages = userMsg
    ? [...historyMessages, userMsg]
    : historyMessages

  if (userMsg) {
    await appendConversation({
      role: userMsg.role as "user" | "assistant",
      parts: userMsg.parts,
      timestamp: new Date().toISOString(),
    })
  }

  const stream = await createChatStream(
    fullMessages,
    skills,
    instructions,
    async (parts) => {
      await appendConversation({
        role: "assistant",
        parts,
        timestamp: new Date().toISOString(),
      })
    }
  )

  return stream
}