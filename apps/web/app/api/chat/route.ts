import { appendConversation, readConversations } from "@roaster/ai/tools/memory"
import type { SkillMetadata } from "@roaster/ai/tools/skills"
import type { UIMessage } from "ai"
import type { NextRequest } from "next/server"
import { buildInstructions } from "./instructions"
import { createChatStream } from "./service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const skills: SkillMetadata[] = []
  const instructions = buildInstructions(skills)

  const { message, id } = (await req.json()) as Awaited<{
    message: UIMessage
    id: string
  }>

  const history = await readConversations(id)

  if (message.role === "user" || message.role === "assistant") {
    await appendConversation({
      role: message.role,
      parts: message.parts,
      timestamp: new Date().toISOString(),
      chatId: id,
    })
  }

  const fullMessages = [...history, message]

  const stream = await createChatStream(
    fullMessages,
    skills,
    instructions,
    async (parts) => {
      await appendConversation({
        role: "assistant",
        parts,
        timestamp: new Date().toISOString(),
        chatId: id,
      })
    }
  )

  return stream
}
